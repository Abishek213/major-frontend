// src/services/organizerAIService.js
import api from "../utils/api";

const IS_DEV = import.meta.env.DEV;

// ─── Valid event types accepted by the backend ────────────────────────────────
const VALID_EVENT_TYPES = [
  "conference",
  "workshop",
  "wedding",
  "birthday",
  "concert",
  "festival",
  "general",
];

// ─── Only call backend when category is a real MongoDB ObjectId ───────────────
const isObjectId = (val) =>
  typeof val === "string" && /^[a-f\d]{24}$/i.test(val);

// ─── Resolve a category value to a valid backend eventType string ─────────────
// Accepts a human-readable name ("concert"), an ObjectId (falls back to "general"),
// or undefined. Always returns one of VALID_EVENT_TYPES.
const resolveEventType = (categoryName) => {
  if (!categoryName) return "general";
  const lower = String(categoryName).toLowerCase().trim();
  if (VALID_EVENT_TYPES.includes(lower)) return lower;
  const aliases = {
    tech:       "conference",
    summit:     "conference",
    seminar:    "conference",
    training:   "workshop",
    class:      "workshop",
    party:      "birthday",
    gig:        "concert",
    show:       "concert",
    live:       "concert",
    fair:       "festival",
    networking: "general",
    meetup:     "general",
    sports:     "general",
    sport:      "general",
  };
  return aliases[lower] ?? "general";
};

class OrganizerAIService {
  // ============================================================
  // INTERNAL: single planning-agent call
  //
  // Sends BOTH camelCase and snake_case versions of every field so the
  // backend controller can find them regardless of how it destructures
  // req.body (e.g. { eventType } vs { event_type }).
  //
  // Callers must supply `categoryName` (the human-readable label)
  // alongside `category` (the ObjectId used only for the isObjectId guard).
  // The ObjectId is NEVER forwarded to the backend.
  // ============================================================
  async _callPlanningAgent(payload) {
    const eventName  = payload.event_name    ?? payload.eventName   ?? "Untitled Event";
    const eventType  = resolveEventType(payload.categoryName ?? payload.eventType);
    const location   = payload.location      ?? "TBD";
    const eventDate  = payload.event_date    ?? payload.eventDate   ??
                       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                         .toISOString()
                         .split("T")[0];
    const totalSlots = Number(payload.totalSlots) || 100;
    const description = (payload.description ?? "").trim() || "Event details pending";
    const time        = payload.time ?? "10:00";

    // Send camelCase AND snake_case so the controller finds the fields
    // regardless of which naming convention it uses internally.
    const normalized = {
      // camelCase (matches frontend contract)
      eventName,
      eventType,
      eventDate,
      totalSlots,
      description,
      time,

      // snake_case (matches many Express controllers)
      event_name:  eventName,
      event_type:  eventType,
      event_date:  eventDate,
      total_slots: totalSlots,

      // location is the same in both conventions
      location,

      // category alias — some controllers accept "category" instead of "eventType"
      category: eventType,
    };

    if (IS_DEV) {
      console.log("📤 _callPlanningAgent payload:", JSON.stringify(normalized, null, 2));
    }

    try {
      const response = await api.post("/ai/organizer/plan-event", normalized);
      return response.data?.data?.fullSuggestions?.suggestions ?? null;
    } catch (error) {
      if (IS_DEV)
        console.error(
          "❌ _callPlanningAgent failed:",
          error.response?.data ?? error.message,
          "\nPayload sent:",
          JSON.stringify(normalized, null, 2)
        );
      throw error;
    }
  }

  // ============================================================
  // EVENT PLANNING AGENT SERVICES
  // Uses: POST /ai/organizer/plan-event (real backend route)
  // Falls back to mock only when backend unavailable OR category invalid
  // ============================================================

  // eventData should include:
  //   category     — MongoDB ObjectId (used for the isObjectId guard)
  //   categoryName — human-readable label, e.g. "concert" (sent to backend as eventType)
  async getPriceSuggestion(eventData) {
    if (isObjectId(eventData.category)) {
      try {
        const suggestions = await this._callPlanningAgent({
          event_name:
            eventData.event_name ||
            `${eventData.categoryName || "Event"} in ${eventData.location || "Location"}`,
          category:     eventData.category,
          categoryName: eventData.categoryName || eventData.category,
          location:     eventData.location || "TBD",
          totalSlots:   parseInt(eventData.totalSlots) || 100,
          event_date:
            eventData.eventDate ||
            eventData.event_date ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          description: eventData.description || "",
          time:        eventData.time || "10:00",
        });

        if (suggestions?.price) {
          return {
            suggestedPrice: suggestions.price.suggestedPrice,
            priceRange: suggestions.price.priceRange || {
              min: Math.round(suggestions.price.suggestedPrice * 0.8),
              max: Math.round(suggestions.price.suggestedPrice * 1.2),
            },
            marketAverage:
              suggestions.price.marketAverage ||
              suggestions.price.suggestedPrice,
            demandScore:  suggestions.price.demandScore || 0.7,
            confidence:   suggestions.price.confidence || 75,
            source: "ai",
          };
        }
        throw new Error("No price data in response");
      } catch (error) {
        if (IS_DEV)
          console.warn(
            "⚠️ getPriceSuggestion falling back to mock:",
            error.message
          );
      }
    } else {
      if (IS_DEV)
        console.info("ℹ️ getPriceSuggestion: no valid categoryId — using mock");
    }
    return this.getMockPriceSuggestion(eventData);
  }

  getMockPriceSuggestion(eventData) {
    const basePrice = 50;
    const multipliers = {
      conference: 2.5,
      workshop:   1.8,
      concert:    3.0,
      sports:     2.2,
      networking: 1.5,
      default:    2.0,
    };
    const key = (eventData?.categoryName || eventData?.category || "").toLowerCase();
    const multiplier = multipliers[key] || multipliers.default;
    const suggestedPrice = Math.round(
      basePrice * multiplier * (0.9 + Math.random() * 0.3)
    );
    return {
      suggestedPrice,
      priceRange: {
        min: Math.round(suggestedPrice * 0.8),
        max: Math.round(suggestedPrice * 1.2),
      },
      marketAverage: Math.round(suggestedPrice * 0.95),
      demandScore:   0.6 + Math.random() * 0.3,
      confidence:    Math.floor(75 + Math.random() * 20),
      source: "mock",
    };
  }

  // category     — MongoDB ObjectId
  // categoryName — human-readable label, e.g. "concert"
  async getTagRecommendations(description, category, categoryName) {
    if (isObjectId(category) && description?.length > 10) {
      try {
        const suggestions = await this._callPlanningAgent({
          event_name:   categoryName || "Event",
          category,
          categoryName: categoryName || category,
          location:     "TBD",
          totalSlots:   100,
          event_date:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0],
          description:  description || "",
          time:         "10:00",
        });

        if (suggestions?.tags?.suggestedTags) {
          const tags = suggestions.tags.suggestedTags;
          return {
            tags: tags.map((tag, i) => ({
              name:       typeof tag === "string" ? tag : tag.name,
              popularity:
                typeof tag === "object" && tag.popularity
                  ? tag.popularity
                  : Math.max(80 - i * 5, 30),
              relevance: Math.max(90 - i * 3, 40),
            })),
            suggested: tags
              .slice(0, 3)
              .map((t) => (typeof t === "string" ? t : t.name)),
            source: "ai",
          };
        }
        throw new Error("No tag data in response");
      } catch (error) {
        if (IS_DEV)
          console.warn(
            "⚠️ getTagRecommendations falling back to mock:",
            error.message
          );
      }
    } else {
      if (IS_DEV)
        console.info(
          "ℹ️ getTagRecommendations: no valid categoryId or description too short — using mock"
        );
    }
    return this.getMockTagRecommendations(categoryName || category);
  }

  getMockTagRecommendations(category) {
    const categoryTags = {
      conference: ["tech", "business", "networking", "innovation", "keynote", "workshop"],
      workshop:   ["hands-on", "learning", "training", "skills", "practical", "interactive"],
      concert:    ["live-music", "performance", "band", "tour", "live", "music-festival"],
      sports:     ["game", "tournament", "competition", "sports", "athlete", "championship"],
      networking: ["business", "professional", "connect", "meetup", "social", "career"],
      default:    ["event", "community", "special", "featured", "popular", "trending"],
    };
    const key  = String(category ?? "").toLowerCase();
    const tags = categoryTags[key] ?? categoryTags.default;
    return {
      tags: tags.map((tag) => ({
        name:       tag,
        popularity: Math.floor(50 + Math.random() * 50),
        relevance:  Math.floor(70 + Math.random() * 30),
      })),
      suggested: tags.slice(0, 3),
      source: "mock",
    };
  }

  // category     — MongoDB ObjectId
  // categoryName — human-readable label, e.g. "concert"
  async getSlotSuggestion(location, category, categoryName) {
    if (isObjectId(category)) {
      try {
        const suggestions = await this._callPlanningAgent({
          event_name:   `${categoryName || "Event"} in ${location || "Location"}`,
          category,
          categoryName: categoryName || category,
          location:     location || "TBD",
          totalSlots:   100,
          event_date:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0],
          time: "10:00",
        });

        if (suggestions?.totalSlots) {
          return {
            suggestedSlots: suggestions.totalSlots.suggestedSlots,
            minRecommended:
              suggestions.totalSlots.minSlots ||
              Math.round(suggestions.totalSlots.suggestedSlots * 0.7),
            maxRecommended:
              suggestions.totalSlots.maxSlots ||
              Math.round(suggestions.totalSlots.suggestedSlots * 1.3),
            reason:
              suggestions.totalSlots.reason ||
              suggestions.totalSlots.reasoning ||
              `Based on similar events in ${location || "your area"}`,
            confidence: suggestions.totalSlots.confidence || 75,
            source: "ai",
          };
        }
        throw new Error("No slot data in response");
      } catch (error) {
        if (IS_DEV)
          console.warn(
            "⚠️ getSlotSuggestion falling back to mock:",
            error.message
          );
      }
    } else {
      if (IS_DEV)
        console.info("ℹ️ getSlotSuggestion: no valid categoryId — using mock");
    }
    return this.getMockSlotSuggestion(location, categoryName || category);
  }

  getMockSlotSuggestion(location, category) {
    const baseSlots = {
      conference: 200,
      workshop:   50,
      concert:    500,
      sports:     1000,
      networking: 100,
      default:    150,
    };
    const key = String(category ?? "").toLowerCase();
    const suggestedSlots = Math.round(
      (baseSlots[key] ?? baseSlots.default) * (0.8 + Math.random() * 0.4)
    );
    return {
      suggestedSlots,
      minRecommended: Math.round(suggestedSlots * 0.7),
      maxRecommended: Math.round(suggestedSlots * 1.3),
      reason:     `Based on similar events in ${location || "your area"}`,
      confidence: Math.floor(70 + Math.random() * 25),
      source: "mock",
    };
  }

  // category     — MongoDB ObjectId
  // categoryName — human-readable label, e.g. "concert"
  async getDateSuggestion(category, categoryName) {
    if (isObjectId(category)) {
      try {
        const suggestions = await this._callPlanningAgent({
          event_name:   categoryName || "Event",
          category,
          categoryName: categoryName || category,
          location:     "TBD",
          totalSlots:   100,
          event_date:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0],
          time: "10:00",
        });

        if (suggestions?.dateTime) {
          return {
            suggestedDates: (suggestions.dateTime.suggestedDates ?? []).map(
              (item) =>
                typeof item === "string"
                  ? { date: item, confidence: 70 }
                  : {
                      date:       item.date ?? item,
                      confidence: item.confidence ?? 70,
                    }
            ),
            bestDayOfWeek:  suggestions.dateTime.suggestedDayOfWeek || "Saturday",
            seasonalFactor: suggestions.dateTime.seasonalFactor || 0.75,
            source: "ai",
          };
        }
        throw new Error("No date data in response");
      } catch (error) {
        if (IS_DEV)
          console.warn(
            "⚠️ getDateSuggestion falling back to mock:",
            error.message
          );
      }
    } else {
      if (IS_DEV)
        console.info("ℹ️ getDateSuggestion: no valid categoryId — using mock");
    }
    return this.getMockDateSuggestion(categoryName || category);
  }

  getMockDateSuggestion(category) {
    const today = new Date();
    const suggestions = [1, 2, 3].map((i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i * 7 + Math.floor(Math.random() * 3));
      return {
        date:       date.toISOString().split("T")[0],
        confidence: Math.floor(70 + Math.random() * 25),
        reason:
          i === 1
            ? "Optimal for weekend attendance"
            : i === 2
            ? "Good for industry calendar"
            : "Avoids major holidays",
      };
    });
    return {
      suggestedDates: suggestions,
      bestDayOfWeek:  ["Friday", "Saturday", "Sunday"][Math.floor(Math.random() * 3)],
      seasonalFactor: Math.random() * 0.5 + 0.5,
      source: "mock",
    };
  }

  // ============================================================
  // NEGOTIATION AGENT SERVICES
  // NOTE: No backend routes exist for these yet.
  // Mock data is intentional until backend adds them.
  // ============================================================

  async createNegotiationOffer(requestId, offerData) {
    if (IS_DEV)
      console.info("ℹ️ createNegotiationOffer: no backend route yet, using mock");
    return {
      success: true,
      offerId: "mock_" + Date.now(),
      status:  "pending",
      message: "Offer submitted successfully",
    };
  }

  async getCompetitorAnalysis(requestId) {
    if (IS_DEV)
      console.info("ℹ️ getCompetitorAnalysis: no backend route yet, using mock");
    return this.getMockCompetitorAnalysis();
  }

  getMockCompetitorAnalysis() {
    const competitors = [
      {
        organizerName: "Elite Events Co.",
        proposedPrice: 4500,
        experience:    45,
        rating:        4.8,
        strengths:     ["Premium service", "Experienced team"],
      },
      {
        organizerName: "Budget Planners",
        proposedPrice: 2800,
        experience:    12,
        rating:        4.2,
        strengths:     ["Affordable", "Flexible"],
      },
      {
        organizerName: "Creative Solutions",
        proposedPrice: 3800,
        experience:    28,
        rating:        4.6,
        strengths:     ["Innovative ideas", "Good reviews"],
      },
    ];
    const marketAvg =
      competitors.reduce((s, c) => s + c.proposedPrice, 0) / competitors.length;
    return {
      analysis: {
        winProbability:   Math.floor(50 + Math.random() * 40),
        marketAverage:    Math.round(marketAvg),
        yourRank:         Math.floor(Math.random() * 3) + 1,
        totalCompetitors: competitors.length,
        insights: [
          { type: "warning",  message: "Your price is above market average by 15%" },
          { type: "positive", message: "You have the highest rating among competitors" },
          { type: "info",     message: "Consider offering early-bird discounts" },
        ],
        suggestedPrice: Math.round(marketAvg * 0.95),
        recommendation: "Focus on your experience and quality to justify premium pricing",
      },
      competitors,
    };
  }

  // ============================================================
  // ORGANIZER DASHBOARD ASSISTANT SERVICES
  // Uses REAL backend routes:
  //   GET /ai/dashboard/metrics/:orgId?dateRange=
  //   GET /ai/dashboard/sentiment/:orgId
  //   GET /ai/dashboard/revenue/:orgId
  //   GET /ai/dashboard/events/:orgId
  // ============================================================

  async getDashboardMetrics(orgId, timeframe = "month") {
    try {
      const response = await api.get(
        `/ai/dashboard/metrics/${orgId}?dateRange=${timeframe}`
      );
      const d = response.data?.data;
      if (!d) throw new Error("Empty response from dashboard metrics");
      return this._transformDashboardMetrics(d, timeframe);
    } catch (error) {
      if (IS_DEV)
        console.warn(
          "⚠️ getDashboardMetrics falling back to mock. Error:",
          error.message
        );
      return this.getMockDashboardMetrics(orgId, timeframe);
    }
  }

  _transformDashboardMetrics(d, timeframe) {
    const totalRevenue   = d.revenue?.total ?? 0;
    const totalBookings  = d.bookings?.total ?? 0;
    const totalEvents    = d.events?.total ?? 0;
    const totalReviews   = d.ratings?.total ?? 0;
    const averageRating  = d.ratings?.average ?? 0;
    const conversionRate =
      d.bookings?.conversionRate != null
        ? Math.round(d.bookings.conversionRate * 100)
        : 0;

    const attendanceDetails = d.events?.attendanceDetails ?? [];
    const revenueByEvent    = d.revenue?.byEvent ?? [];

    const events = attendanceDetails.map((ev) => {
      const revenueInfo =
        revenueByEvent.find((r) => String(r._id) === String(ev._id)) ?? {};
      const ratingInfo =
        (d.ratings?.byEvent ?? []).find(
          (r) => String(r._id) === String(ev._id)
        ) ?? {};
      return {
        name:           ev.event_name ?? "Unnamed Event",
        attendees:      ev.attendeeCount ?? 0,
        totalSlots:     ev.totalSlots ?? 1,
        revenue:        revenueInfo.revenue ?? 0,
        bookings:       revenueInfo.bookings ?? ev.attendeeCount ?? 0,
        rating:         ratingInfo.averageRating ?? 0,
        attendanceRate: Math.round((ev.attendanceRate ?? 0) * 100),
      };
    });

    const byMonth = d.revenue?.byMonth ?? [];
    let revenueTrend = 0;
    if (byMonth.length >= 2) {
      const prev = byMonth[byMonth.length - 2]?.revenue ?? 0;
      const curr = byMonth[byMonth.length - 1]?.revenue ?? 0;
      revenueTrend = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
    }

    return {
      totalRevenue,
      totalBookings,
      totalEvents,
      totalReviews,
      averageRating,
      conversionRate,
      revenueTrend,
      bookingTrend:    0,
      conversionTrend: 0,
      events,
      timeframe,
      _raw: d,
    };
  }

  getMockDashboardMetrics(orgId, timeframe) {
    const events = [
      { name: "Tech Conference 2024", attendees: 245, totalSlots: 300, revenue: 36750, rating: 4.8 },
      { name: "JavaScript Workshop",  attendees: 45,  totalSlots: 50,  revenue: 2250,  rating: 4.6 },
      { name: "Startup Networking",   attendees: 78,  totalSlots: 100, revenue: 1170,  rating: 4.7 },
      { name: "AI Summit",            attendees: 156, totalSlots: 200, revenue: 23400, rating: 4.9 },
    ];
    const totalRevenue  = events.reduce((s, e) => s + e.revenue, 0);
    const totalBookings = events.reduce((s, e) => s + e.attendees, 0);
    return {
      totalRevenue,
      totalBookings,
      totalEvents:     events.length,
      totalReviews:    events.reduce((s, e) => s + Math.floor(e.attendees * 0.3), 0),
      averageRating:   events.reduce((s, e) => s + e.rating, 0) / events.length,
      revenueTrend:    Math.floor(Math.random() * 20) + 5,
      bookingTrend:    Math.floor(Math.random() * 15) + 3,
      conversionTrend: Math.floor(Math.random() * 10) + 2,
      conversionRate:  Math.floor(Math.random() * 30) + 60,
      events: events.map((e) => ({
        ...e,
        bookings:       e.attendees,
        attendanceRate: Math.round((e.attendees / e.totalSlots) * 100),
      })),
      timeframe,
    };
  }

  async getSentimentAnalysis(orgId) {
    try {
      const response = await api.get(`/ai/dashboard/sentiment/${orgId}`);
      const d = response.data?.data;
      if (!d) throw new Error("Empty response from sentiment API");
      return this._transformSentimentData(d);
    } catch (error) {
      if (IS_DEV)
        console.warn(
          "⚠️ getSentimentAnalysis falling back to mock. Error:",
          error.message
        );
      return this.getMockSentimentAnalysis();
    }
  }

  _transformSentimentData(d) {
    const { positive = 0, neutral = 0, negative = 0 } = d.distribution ?? {};
    const total       = positive + neutral + negative || 1;
    const positivePct = Math.round((positive / total) * 100);
    const neutralPct  = Math.round((neutral  / total) * 100);
    const negativePct = 100 - positivePct - neutralPct;

    const rawScore        = d.averageScore ?? 0;
    const normalisedScore = (rawScore + 1) / 2;
    const sentimentLabel  =
      normalisedScore > 0.65
        ? "Very Positive"
        : normalisedScore > 0.5
        ? "Positive"
        : normalisedScore > 0.35
        ? "Mixed"
        : "Needs Attention";

    const topKeywords = (d.commonIssues ?? [])
      .slice(0, 6)
      .map((i) => i._id)
      .filter(Boolean);

    const insights = [];
    if (positivePct > 70)
      insights.push(`${positivePct}% of attendees left positive feedback — great work!`);
    if (negativePct > 25)
      insights.push(`${negativePct}% of reviews are negative — consider reviewing common issues.`);
    if (d.commonIssues?.length > 0)
      insights.push(
        `Top reported issue: "${d.commonIssues[0]?._id}" (${d.commonIssues[0]?.count} mentions)`
      );
    if (d.totalAnalyzed > 0)
      insights.push(`${d.totalAnalyzed} reviews analysed by AI sentiment engine.`);

    const trends = (d.overTime ?? []).map((t) => ({
      date:  `${t._id?.year}-${String(t._id?.month).padStart(2, "0")}`,
      score: t.averageScore ?? 0,
    }));

    return {
      overallSentiment: normalisedScore,
      sentimentLabel,
      distribution: { positive: positivePct, neutral: neutralPct, negative: negativePct },
      topKeywords,
      insights,
      trends,
      totalAnalyzed: d.totalAnalyzed ?? 0,
      _raw: d,
    };
  }

  getMockSentimentAnalysis() {
    const positive = Math.floor(60 + Math.random() * 25);
    const neutral  = Math.floor(10 + Math.random() * 20);
    const negative = 100 - positive - neutral;
    return {
      overallSentiment: (positive / 100) * 0.8 + 0.2,
      sentimentLabel:
        positive > 70 ? "Very Positive" : positive > 50 ? "Positive" : "Mixed",
      distribution: { positive, neutral, negative },
      topKeywords: ["great", "organised", "informative", "engaging", "professional", "valuable"],
      insights: [
        "Attendees appreciate the quality of speakers",
        "Venue location is convenient for most",
        "Consider adding more networking time",
        "Food quality feedback is consistently positive",
      ],
      trends: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
        date:  d,
        score: 0.75 + i * 0.02,
      })),
      totalAnalyzed: 0,
    };
  }

  // getEventPerformance — uses real backend: /ai/dashboard/revenue + /ai/dashboard/events
  async getEventPerformance(orgId, eventId = null) {
    try {
      const [revenueRes, eventsRes] = await Promise.all([
        api.get(`/ai/dashboard/revenue/${orgId}`),
        api.get(`/ai/dashboard/events/${orgId}`),
      ]);

      const revenue = revenueRes.data?.data;
      const events  = eventsRes.data?.data;

      let list = revenue?.byEvent ?? [];
      if (eventId) list = list.filter((e) => String(e._id) === String(eventId));

      return {
        events: list.map((e) => ({
          id:       e._id,
          name:     e.eventName,
          revenue:  e.revenue,
          bookings: e.bookings,
          capacity:
            events?.attendanceDetails?.find(
              (a) => String(a._id) === String(e._id)
            )?.totalSlots ?? 0,
          rating: 0,
        })),
      };
    } catch (error) {
      if (IS_DEV)
        console.warn("⚠️ getEventPerformance falling back to mock:", error.message);
      return { events: [] };
    }
  }

  // ─── Agent meta ───────────────────────────────────────────────────────────

  async checkPlanningAgentHealth() {
    const response = await api.get(`/ai/organizer/planning-agent/stats`);
    return response.data ?? response;
  }

  async getPlanningAgentStats(timeRange = "30d") {
    const response = await api.get(
      `/ai/organizer/planning/stats?timeRange=${timeRange}`
    );
    return response.data?.data ?? {};
  }
}

const organizerAIService = new OrganizerAIService();
export default organizerAIService;