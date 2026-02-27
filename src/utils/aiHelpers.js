/**
 * AI Helper Functions for processing and formatting AI-related data
 */

export const getConfidenceLevel = (score) => {
  // Normalize to 0-1 range regardless of whether caller passes 0-1 or 0-100
  const normalized = score > 1 ? score / 100 : score;

  if (normalized >= 0.9) return "Very High";
  if (normalized >= 0.7) return "High";
  if (normalized >= 0.5) return "Medium";
  if (normalized >= 0.3) return "Low";
  return "Very Low";
};

/**
 * Get color class based on sentiment score
 * @param {number} score - Sentiment score (-1 to 1)
 * @returns {string} Tailwind CSS color class
 */
export const getSentimentColor = (score) => {
  if (score > 0.5) return "text-green-600";
  if (score > 0) return "text-green-400";
  if (score > -0.5) return "text-yellow-600";
  return "text-red-600";
};

/**
 * Get background color based on sentiment score
 * @param {number} score - Sentiment score (-1 to 1)
 * @returns {string} Tailwind CSS background class
 */
export const getSentimentBgColor = (score) => {
  if (score > 0.5) return "bg-green-100";
  if (score > 0) return "bg-green-50";
  if (score > -0.5) return "bg-yellow-100";
  return "bg-red-100";
};

/**
 * Format AI suggestion for display
 * @param {Object} suggestion - AI suggestion object
 * @returns {Object} Formatted suggestion
 */
export const formatAISuggestion = (suggestion) => {
  return {
    ...suggestion,
    confidenceLabel: getConfidenceLevel(suggestion.confidence),
    formattedDate: suggestion.date
      ? new Date(suggestion.date).toLocaleDateString()
      : null,
    formattedValue: suggestion.value
      ? typeof suggestion.value === "number" && suggestion.value > 1000
        ? `$${suggestion.value.toLocaleString()}`
        : suggestion.value
      : null,
  };
};

/**
 * Group AI insights by category
 * @param {Array} insights - Array of insight objects
 * @returns {Object} Grouped insights
 */
export const groupInsightsByCategory = (insights) => {
  return insights.reduce((acc, insight) => {
    const category = insight.category || "general";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(insight);
    return acc;
  }, {});
};

/**
 * Calculate trend from data points
 * @param {Array} dataPoints - Array of numeric values
 * @returns {Object} Trend analysis
 */
export const calculateTrend = (dataPoints) => {
  if (!dataPoints || dataPoints.length < 2) {
    return { direction: "stable", percentage: 0 };
  }

  const first = dataPoints[0];
  const last = dataPoints[dataPoints.length - 1];
  const change = last - first;
  const percentage = first !== 0 ? (change / first) * 100 : 0;

  return {
    direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
    percentage: Math.abs(percentage).toFixed(1),
    absolute: change,
  };
};

/**
 * Generate recommendation priority
 * @param {number} score - Priority score (0-100)
 * @returns {string} Priority level
 */
export const getPriorityLevel = (score) => {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "Optional";
};

/**
 * Format AI response for UI components
 * @param {Object} response - Raw AI response
 * @returns {Object} Formatted response
 */
export const formatAIResponse = (response) => {
  return {
    ...response,
    timestamp: new Date().toISOString(),
    formattedData: response.data
      ? {
          labels: response.data.map((_, i) => `Item ${i + 1}`),
          values: response.data,
        }
      : null,
    summary: response.insights ? generateSummary(response.insights) : null,
  };
};

/**
 * Generate summary from insights
 * @param {Array} insights - Array of insight strings
 * @returns {string} Summary text
 */
const generateSummary = (insights) => {
  if (!insights || insights.length === 0) return "";
  if (insights.length === 1) return insights[0];

  const topInsights = insights.slice(0, 3);
  return `${topInsights.join(". ")}${
    insights.length > 3 ? ` and ${insights.length - 3} more insights.` : "."
  }`;
};

/**
 * Check if AI feature should be enabled based on user role
 * @param {string} userRole - User role
 * @param {string} feature - AI feature name
 * @returns {boolean} Whether feature is enabled
 */
export const isAIFeatureEnabled = (userRole, feature) => {
  const featureAccess = {
    admin: ["fraud", "analytics", "sentiment", "all"],
    organizer: ["planning", "negotiation", "dashboard", "all"],
    user: ["recommendations", "assistant", "all"],
  };

  return (
    featureAccess[userRole]?.includes(feature) ||
    featureAccess[userRole]?.includes("all") ||
    false
  );
};

/**
 * Cache AI responses for performance using in-memory storage.
 *
 * NOTE: Previously used localStorage. Kept as in-memory Map so this module
 * works correctly in all environments (SSR, test, etc.) while still providing
 * TTL-based expiry. For persistent cross-session caching, the backend's 24h
 * DB cache in ai_service.js / ai_controller.js is the authoritative store.
 *
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default 5 min)
 */
const _memCache = new Map();

export const cacheAIResponse = (key, data, ttl = 5 * 60 * 1000) => {
  _memCache.set(key, { data, timestamp: Date.now(), ttl });
};

/**
 * Get cached AI response
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired / not found
 */
export const getCachedAIResponse = (key) => {
  const entry = _memCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > entry.ttl) {
    _memCache.delete(key);
    return null;
  }

  return entry.data;
};

/**
 * Clear all expired entries from the in-memory AI cache.
 */
export const clearExpiredAICache = () => {
  const now = Date.now();
  for (const [key, entry] of _memCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      _memCache.delete(key);
    }
  }
};
