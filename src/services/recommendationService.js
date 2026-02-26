import api from "../utils/api";

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
    rating: 4.5, // backend doesn't store ratings on events yet; use placeholder

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

  async getRecommendations(limit = 10) {
    try {
      const response = await api.safeGet(
        `/ai/recommendations/me?limit=${limit}`
      );
      const body = response?.data;
      if (!body?.success)
        throw new Error(body?.message || "Failed to fetch recommendations");
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

  async getMyRecommendations(limit = 10) {
    return this.getRecommendations(limit);
  }

  trackRecommendationView(userId, eventIds) {
    if (import.meta.env.DEV) {
      console.log("[RecommendationService] trackView (stub):", {
        userId,
        eventIds,
      });
    }
  }

  trackInteraction(userId, eventId, interactionType) {
    if (import.meta.env.DEV) {
      console.log("[RecommendationService] trackInteraction (stub):", {
        userId,
        eventId,
        interactionType,
      });
    }
  }
}

export default new RecommendationService();
