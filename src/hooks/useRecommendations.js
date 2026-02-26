// src/hooks/useRecommendations.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import recommendationService from "../services/recommendationService";

/**
 * useRecommendations
 *
 * Provides AI-powered event recommendations for the authenticated user.
 * Calls the real backend endpoints via recommendationService.
 * Falls back to an empty array (RecommendationSection handles its own
 * mock/fallback display when the array is empty).
 *
 * Exposes the full API that RecommendationSection.jsx expects:
 *  - recommendations, loading, error
 *  - fetchRecommendations(filters?)  → returns normalized array
 *  - getPersonalizedInsights()       → derived from current recommendations
 *  - getSimilarEvents(eventId)       → stub (extend when backend ready)
 *  - getTrendingCategories()         → derived from current recommendations
 *  - refreshRecommendations()
 *  - rateRecommendation(eventId, rating) → stub
 *  - getRecommendationInsights()     → alias for getPersonalizedInsights
 */
export const useRecommendations = (externalUserId) => {
  const { user } = useAuth();
  const userId = externalUserId || user?.id;

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'ai_agent' | 'cache' | 'fallback'
  const [lastFetched, setLastFetched] = useState(null);

  // Ref to cancel in-flight fetches when userId changes or component unmounts
  const fetchIdRef = useRef(0);

  // Refs so getPersonalizedInsights can read latest values without being
  // re-created on every state change (prevents the infinite-fetch loop).
  const recommendationsRef = useRef([]);
  const lastFetchedRef = useRef(null);
  const sourceRef = useRef(null);

  // ─── Core fetch ──────────────────────────────────────────────────────────

  /**
   * Fetches recommendations from the backend.
   * Also accepts an optional `filters` object from RecommendationSection —
   * client-side filtering is applied here since the backend recommendation
   * endpoint does not yet support filter query params.
   *
   * @param {object|boolean} filtersOrRefresh  – filter object OR boolean refresh flag
   * @returns {Array} normalized recommendation objects (also sets state)
   */
  const fetchRecommendations = useCallback(
    async (filtersOrRefresh = false) => {
      if (!userId) return [];

      const isRefreshBool = typeof filtersOrRefresh === "boolean";
      const forceRefresh = isRefreshBool ? filtersOrRefresh : false;
      const filters = isRefreshBool ? null : filtersOrRefresh;

      const currentFetchId = ++fetchIdRef.current;
      setLoading(true);
      setError(null);

      try {
        // 1. Try AI recommendations first
        let data = await recommendationService.getRecommendations(
          20,
          forceRefresh
        );

        // 2. If AI gave nothing, fall back to stored DB recommendations
        if (!data.length) {
          data = await recommendationService.getMyRecommendations(20);
        }

        // Guard: ignore result if a newer fetch has started
        if (currentFetchId !== fetchIdRef.current) return [];

        // 3. Apply client-side filters if passed from RecommendationSection
        if (filters && data.length) {
          data = applyClientFilters(data, filters);
        }

        setRecommendations(data);
        setLastFetched(new Date());
        setSource(data.length ? "backend" : "empty");
        // Keep refs in sync so getPersonalizedInsights always reads fresh values
        recommendationsRef.current = data;
        lastFetchedRef.current = new Date();
        sourceRef.current = data.length ? "backend" : "empty";
        return data;
      } catch (err) {
        if (currentFetchId !== fetchIdRef.current) return [];
        const message = err.message || "Failed to fetch recommendations";
        setError(message);
        console.error("[useRecommendations] fetch error:", message);
        return [];
      } finally {
        if (currentFetchId === fetchIdRef.current) setLoading(false);
      }
    },
    [userId]
  );

  // ─── Client-side filter helper ────────────────────────────────────────────

  function applyClientFilters(data, filters) {
    let result = [...data];

    if (filters.categories?.length) {
      result = result.filter(
        (r) =>
          filters.categories.includes(r.categoryId) ||
          filters.categories.some((c) => r.category?.toLowerCase().includes(c))
      );
    }

    if (filters.priceRange && filters.priceRange !== "any") {
      switch (filters.priceRange) {
        case "free":
          result = result.filter((r) => r.price === 0);
          break;
        case "under50":
          result = result.filter((r) => r.price < 50);
          break;
        case "50-100":
          result = result.filter((r) => r.price >= 50 && r.price <= 100);
          break;
        case "over100":
          result = result.filter((r) => r.price > 100);
          break;
      }
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      result = result.filter((r) => r.location?.toLowerCase().includes(loc));
    }

    if (filters.eventType && filters.eventType !== "all") {
      if (filters.eventType === "virtual")
        result = result.filter((r) => r.isVirtual);
      if (filters.eventType === "in-person")
        result = result.filter((r) => !r.isVirtual);
    }

    if (filters.minRating) {
      result = result.filter((r) => (r.rating || 0) >= filters.minRating);
    }

    // Sorting
    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        result.sort((a, b) => b.attendees - a.attendees);
        break;
      case "date":
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      default:
        result.sort((a, b) => b.aiScore - a.aiScore); // relevance
    }

    return result;
  }

  // ─── Derived / helper methods expected by RecommendationSection ──────────

  /**
   * getPersonalizedInsights
   * Derives insight data from the current recommendations array.
   * Returns the shape that RecommendationSection's aiInsights banner expects.
   */
  // NOTE: deps array is intentionally empty so this function keeps a STABLE
  // reference across renders.  It reads current values via refs instead of
  // closing over state.
  //
  // WHY: putting `recommendations`, `lastFetched`, or `source` in the deps
  // array caused a new function reference after every fetch, which propagated
  // to fetchRecommendations in RecommendationSection (which listed this as a
  // dep), which re-triggered the useEffects that call fetchRecommendations →
  // infinite loop.
  const getPersonalizedInsights = useCallback(
    async (dataOverride) => {
      // dataOverride lets callers pass freshly-fetched data before React's
      // state update has propagated; fallback reads via ref (always current).
      const data = dataOverride ?? recommendationsRef.current;
      if (!data.length) return null;

      const avgScore =
        data.reduce((acc, r) => acc + (r.aiScore || 0), 0) / data.length;

      const categoryMap = {};
      data.forEach((r) => {
        const key =
          r.categoryId || r.category?.toLowerCase().replace(/\s+/g, "-");
        categoryMap[key] = (categoryMap[key] || 0) + 1;
      });

      const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      const trends = topCategories.map((c) => ({
        name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
        growth: null,
      }));

      const lf = lastFetchedRef.current;
      return {
        topMatch: data[0] || null,
        matchScore: Math.round(avgScore),
        recommendations: data.length,
        categories: topCategories,
        trends,
        summary: `Found ${data.length} personalized recommendation${
          data.length !== 1 ? "s" : ""
        } based on your activity`,
        lastUpdated: lf ? lf.toLocaleTimeString() : null,
        source: sourceRef.current,
      };
    },
    [] // stable — reads via refs, never re-created
  );

  /**
   * getTrendingCategories
   * Returns categories sorted by how many recommendations belong to each.
   */
  const getTrendingCategories = useCallback(() => {
    if (!recommendations.length) return [];
    const map = {};
    recommendations.forEach((r) => {
      const key = r.category || "General";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [recommendations]);

  /**
   * getSimilarEvents
   * Stub — extend when the backend exposes a similarity endpoint.
   */
  const getSimilarEvents = useCallback(
    async (eventId) => {
      if (import.meta.env.DEV) {
        console.log(
          "[useRecommendations] getSimilarEvents stub called for:",
          eventId
        );
      }
      // Return other recommendations as "similar" for now
      return recommendations.filter((r) => r.id !== eventId).slice(0, 3);
    },
    [recommendations]
  );

  /**
   * rateRecommendation
   * Updates local state optimistically; backend rating endpoint can be wired
   * in here when ready.
   */
  const rateRecommendation = useCallback(async (eventId, rating) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === eventId ? { ...r, userRating: rating } : r))
    );
    if (import.meta.env.DEV) {
      console.log("[useRecommendations] rateRecommendation stub:", {
        eventId,
        rating,
      });
    }
  }, []);

  const refreshRecommendations = useCallback(() => {
    return fetchRecommendations(true);
  }, [fetchRecommendations]);

  /**
   * getRecommendationInsights — alias used by older callers
   */
  const getRecommendationInsights = useCallback(() => {
    if (!recommendations.length) return null;
    const categories = [...new Set(recommendations.map((r) => r.category))];
    const avgMatchScore = Math.round(
      recommendations.reduce((acc, r) => acc + (r.aiScore || 0), 0) /
        recommendations.length
    );
    return {
      total: recommendations.length,
      categories,
      avgMatchScore,
      lastUpdated: lastFetched ? lastFetched.toLocaleTimeString() : "Not yet",
    };
  }, [recommendations, lastFetched]);

  // ─── Preferences (kept for API compatibility; not sent to backend yet) ────
  const [preferences, setPreferences] = useState({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    location: "",
    dateRange: null,
  });

  const updatePreferences = useCallback((newPrefs) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  }, []);

  // ─── Auto-fetch on mount / when userId becomes available ─────────────────
  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      fetchIdRef.current = -1;
    };
  }, []);

  return {
    // State
    recommendations,
    loading,
    error,
    source,
    preferences,

    // Actions
    fetchRecommendations,
    refreshRecommendations,
    rateRecommendation,
    updatePreferences,

    // Insight helpers
    getPersonalizedInsights,
    getTrendingCategories,
    getSimilarEvents,
    getRecommendationInsights,

    // Deprecated alias kept for compatibility
    insights: null,
  };
};
