// src/hooks/useRecommendations.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import recommendationService from "../services/recommendationService";

/**
 * useRecommendations
 *
 * Provides AI-powered event recommendations for the authenticated user.
 * Calls the real backend endpoints via recommendationService.
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
   * FIX (Bug 5): Previously the hook made TWO sequential network calls:
   *   1. recommendationService.getRecommendations(20, forceRefresh)
   *   2. if empty → recommendationService.getMyRecommendations(20)
   *
   * Both methods call the same backend endpoint (GET /ai/recommendations/me)
   * which already implements its own full fallback chain (DB cache → AI Agent
   * → popular events fallback). The second call was always redundant — if the
   * first returned [], the second would too.  It doubled network traffic for
   * every new user (whose cache is always empty on first visit).
   * Fixed to a single call; the backend's own fallback chain handles the rest.
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
        // Single call — backend already handles DB cache → AI Agent → fallback
        let data = await recommendationService.getRecommendations(
          20,
          forceRefresh
        );

        // Guard: ignore result if a newer fetch has started
        if (currentFetchId !== fetchIdRef.current) return [];

        // FIX (Bug B — defense in depth): Deduplicate by event id.
        // The backend controller already deduplicates, but 3 concurrent stores
        // can insert duplicate DB rows before the dedup on the READ side runs.
        // Client-side dedup guarantees the UI never receives two records for the
        // same event regardless of DB state (eliminates duplicate React key warning).
        const seenIds = new Set();
        data = data.filter((r) => {
          const key = r.id?.toString();
          if (!key || seenIds.has(key)) return false;
          seenIds.add(key);
          return true;
        });

        // Apply client-side filters if passed from RecommendationSection
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
   *
   * NOTE: deps array is intentionally empty so this function keeps a STABLE
   * reference across renders. It reads current values via refs instead of
   * closing over state. Putting recommendations/lastFetched/source in deps
   * would cause a new function reference after every fetch → re-triggers
   * RecommendationSection's fetchRecommendations → infinite loop.
   */
  const getPersonalizedInsights = useCallback(
    async (dataOverride) => {
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

      // FIX: growth is computed from the count ratio rather than returning null.
      // The AI Insights banner renders `+{trend.growth}%` — previously this was
      // always `+null%` because growth was hardcoded to null. Now each category's
      // "growth" is expressed as the percentage share of total recommendations it
      // represents (a meaningful relative weight until real time-series data is
      // available from the backend).
      const totalRecs = data.length;
      const trends = topCategories.map((c) => ({
        name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
        growth: ((c.count / totalRecs) * 100).toFixed(0),
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
    [] // stable — reads via refs
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

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      // FIX (Bug A — ghost fetch after StrictMode remount):
      // The previous cleanup set fetchIdRef.current = -1. React StrictMode
      // unmounts and immediately remounts the component in dev mode. After
      // cleanup the ref is -1. The remount increments it: -1→0 (fetch #2),
      // then the debounced effect increments again: 0→1 (fetch #3).
      //
      // A pre-unmount fetch that stored currentFetchId = 1 resolves AFTER
      // the remount, sees fetchIdRef.current = 1 again, decides it is not
      // stale, and calls setRecommendations — a ghost fetch from a
      // conceptually-dead component render.
      //
      // Fix: set to Number.MAX_SAFE_INTEGER. The integer counter increments
      // from 0 upward and will never reach this value in practice, so any
      // in-flight fetch whose currentFetchId was set before the unmount will
      // correctly see currentFetchId !== fetchIdRef.current and bail.
      fetchIdRef.current = Number.MAX_SAFE_INTEGER;
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
