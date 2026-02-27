import api from "../utils/api";

/**
 * Normalizes a raw recommendation record from the backend into the shape
 * consumed by RecommendationSection and other UI components.
 *
 * Expected input shape (DB-populated):
 *   rec.event_id  — populated event object with nested category
 *   rec.confidence_score  — 0–1 float
 *   rec.recommendation_reason — string
 *   rec.agent_id  — populated agent object
 *   rec.source    — "ai_agent" | "cache" | "fallback"
 *
 * This shape is guaranteed by the fixed getMyRecommendations in ai_controller.js,
 * which now deep-populates `event_id.category` and shapes fallback data
 * to the same structure so this normalizer always receives consistent input.
 */
function normalizeRecommendation(rec) {
  const ev = rec.event_id || {};
  const score = Math.round((rec.confidence_score || 0) * 100);

  // Format date
  let formattedDate = "";
  if (ev.event_date) {
    try {
      formattedDate = new Date(ev.event_date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      formattedDate = ev.event_date;
    }
  }

  // Determine badges from confidence level
  const badges = [];
  if (score >= 90) badges.push("trending");
  if (score >= 95) badges.push("premium");

  // Attendee count (backend stores attendees as an array of user IDs)
  const attendeeCount = Array.isArray(ev.attendees) ? ev.attendees.length : 0;

  return {
    // Identity
    id: ev._id || rec._id,
    recommendationId: rec._id,

    // Display fields
    title: ev.event_name || "Untitled Event",
    // ev.category is now correctly populated (category_Name available) because
    // ai_controller.js uses a nested populate({ path:"event_id", populate:{path:"category"} })
    category: ev.category?.category_Name || "General",
    categoryId: (ev.category?.category_Name || "general")
      .toLowerCase()
      .replace(/\s+/g, "-"),
    description: ev.description || "",

    // Scheduling
    date: formattedDate,
    time: ev.time || "",

    // Location
    location: ev.location || "TBD",
    isVirtual:
      (ev.location || "").toLowerCase().includes("online") ||
      (ev.location || "").toLowerCase().includes("virtual"),
    distance: 0, // backend doesn't provide distance yet

    // Pricing
    price: typeof ev.price === "number" ? ev.price : parseFloat(ev.price) || 0,
    originalPrice:
      typeof ev.price === "number" ? ev.price : parseFloat(ev.price) || 0,

    // Media
    image:
      ev.image ||
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop",

    // Tags
    tags: Array.isArray(ev.tags) ? ev.tags : [],

    // AI fields — mapped directly from backend
    aiScore: score,
    confidence: score,
    aiReason: rec.recommendation_reason || "",
    matchReasons: rec.recommendation_reason
      ? [rec.recommendation_reason]
      : ["Personalized recommendation based on your activity"],

    // Stats
    attendees: attendeeCount,
    rating: 4.5, // TODO: wire up real event ratings once review aggregation is added

    // Status flags
    promoted: false,
    goingFast:
      attendeeCount > 0 && ev.totalSlots
        ? attendeeCount / ev.totalSlots > 0.7
        : false,
    salesEndSoon: false,
    badges,

    // Meta
    agentName: rec.agent_id?.name || "AI Agent",
    source: rec.source || "ai",
  };
}

class RecommendationService {
  /**
   * Fetch personalized recommendations for the authenticated user.
   *
   * Calls GET /ai/recommendations/me which maps to getMyRecommendations()
   * in ai_controller.js. That function now implements a full fallback chain:
   *   1. DB cache (24h TTL)
   *   2. AI Agent generation + store to DB
   *   3. Popular events fallback
   *
   * @param {number} limit   Max number of recommendations to return
   * @param {boolean} refresh  Pass true to bypass the 24h cache
   */
  async getRecommendations(limit = 10, refresh = false) {
    try {
      const params = new URLSearchParams({ limit });
      if (refresh) params.set("refresh", "true");

      const response = await api.safeGet(
        `/ai/recommendations/me?${params.toString()}`
      );
      const body = response?.data;

      if (!body?.success) {
        throw new Error(body?.message || "Failed to fetch recommendations");
      }

      return Array.isArray(body.data)
        ? body.data.map(normalizeRecommendation)
        : [];
    } catch (error) {
      console.error(
        "[RecommendationService] getRecommendations error:",
        error.message
      );
      return [];
    }
  }

  /**
   * Alias kept for backward compatibility with components that call
   * getMyRecommendations() directly.
   */
  async getMyRecommendations(limit = 10) {
    return this.getRecommendations(limit);
  }

  /**
   * Force-refresh recommendations, bypassing the DB cache.
   * Useful for a "Refresh" button in the UI.
   */
  async refreshRecommendations(limit = 10) {
    return this.getRecommendations(limit, true);
  }

  // ── Interaction tracking (stubs — wire up to a real endpoint when ready) ──

  trackRecommendationView(userId, eventIds) {
    if (import.meta.env.DEV) {
      console.log("[RecommendationService] trackView (stub):", {
        userId,
        eventIds,
      });
    }
    // TODO: POST /ai/recommendations/track-view
  }

  trackInteraction(userId, eventId, interactionType) {
    if (import.meta.env.DEV) {
      console.log("[RecommendationService] trackInteraction (stub):", {
        userId,
        eventId,
        interactionType,
      });
    }
    // TODO: POST /ai/recommendations/track-interaction
  }
}

export default new RecommendationService();
