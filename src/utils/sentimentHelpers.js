/**
 * Sentiment Analysis Helper Functions
 */

/**
 * Get sentiment label from score
 * @param {number} score - Sentiment score (-1 to 1)
 * @returns {string} Sentiment label
 */
export const getSentimentLabel = (score) => {
  if (score >= 0.7) return 'Very Positive';
  if (score >= 0.3) return 'Positive';
  if (score >= -0.3) return 'Neutral';
  if (score >= -0.7) return 'Negative';
  return 'Very Negative';
};

/**
 * Get sentiment emoji
 * @param {number} score - Sentiment score (-1 to 1)
 * @returns {string} Sentiment emoji
 */
export const getSentimentEmoji = (score) => {
  if (score >= 0.7) return '😄';
  if (score >= 0.3) return '🙂';
  if (score >= -0.3) return '😐';
  if (score >= -0.7) return '☹️';
  return '😡';
};

/**
 * Extract key phrases from text
 * @param {string} text - Input text
 * @param {number} maxPhrases - Maximum number of phrases
 * @returns {Array} Key phrases
 */
export const extractKeyPhrases = (text, maxPhrases = 5) => {
  if (!text) return [];

  // Simple phrase extraction based on common patterns
  const sentences = text.split(/[.!?]+/);
  const phrases = [];
  
  sentences.forEach(sentence => {
    // Look for noun phrases (simplified)
    const words = sentence.trim().split(' ');
    if (words.length > 3 && words.length < 10) {
      phrases.push(sentence.trim());
    }
  });

  return phrases.slice(0, maxPhrases);
};

/**
 * Calculate average sentiment from multiple reviews
 * @param {Array} reviews - Array of review objects with sentiment scores
 * @returns {Object} Average sentiment analysis
 */
export const calculateAverageSentiment = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      average: 0,
      label: 'No Data',
      distribution: { positive: 0, neutral: 0, negative: 0 }
    };
  }

  const total = reviews.reduce((sum, review) => sum + review.sentimentScore, 0);
  const average = total / reviews.length;

  const distribution = {
    positive: reviews.filter(r => r.sentimentScore > 0.3).length,
    neutral: reviews.filter(r => r.sentimentScore >= -0.3 && r.sentimentScore <= 0.3).length,
    negative: reviews.filter(r => r.sentimentScore < -0.3).length
  };

  Object.keys(distribution).forEach(key => {
    distribution[key] = (distribution[key] / reviews.length) * 100;
  });

  return {
    average,
    label: getSentimentLabel(average),
    emoji: getSentimentEmoji(average),
    distribution
  };
};

/**
 * Detect toxic language patterns
 * @param {string} text - Input text
 * @returns {Object} Toxicity analysis
 */
export const detectToxicity = (text) => {
  if (!text) return { toxic: false, categories: [], score: 0 };

  const toxicPatterns = {
    profanity: /\b(fuck|shit|damn|hell|ass)\b/i,
    harassment: /\b(stupid|idiot|dumb|moron)\b/i,
    threat: /\b(kill|hurt|attack|destroy)\b/i,
    spam: /(.)\1{4,}|[A-Z]{5,}/,
    personal_info: /\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/
  };

  const detected = [];
  let score = 0;

  Object.entries(toxicPatterns).forEach(([category, pattern]) => {
    if (pattern.test(text)) {
      detected.push(category);
      score += 0.25;
    }
  });

  return {
    toxic: detected.length > 0,
    categories: detected,
    score: Math.min(score, 1),
    level: score > 0.7 ? 'high' : score > 0.3 ? 'medium' : 'low'
  };
};

/**
 * Generate actionable insights from feedback
 * @param {Array} feedback - Array of feedback items
 * @returns {Array} Actionable insights
 */
export const generateActionableInsights = (feedback) => {
  const insights = [];
  const negativeFeedback = feedback.filter(f => f.sentimentScore < -0.3);

  if (negativeFeedback.length === 0) return [];

  // Group by common themes
  const themes = {};

  negativeFeedback.forEach(item => {
    const words = item.text.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 3) {
        themes[word] = (themes[word] || 0) + 1;
      }
    });
  });

  // Generate insights from common themes
  const commonIssues = Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  commonIssues.forEach(([issue, count]) => {
    insights.push({
      type: 'improvement',
      issue,
      frequency: count,
      suggestion: `Consider addressing issues related to "${issue}" mentioned in ${count} reviews`
    });
  });

  return insights;
};

/**
 * Format sentiment for visualization
 * @param {Array} data - Raw sentiment data
 * @returns {Object} Formatted data for charts
 */
export const formatSentimentForVisualization = (data) => {
  return {
    labels: ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'],
    datasets: [{
      data: [
        data.filter(d => d.sentimentScore >= 0.7).length,
        data.filter(d => d.sentimentScore >= 0.3 && d.sentimentScore < 0.7).length,
        data.filter(d => d.sentimentScore > -0.3 && d.sentimentScore < 0.3).length,
        data.filter(d => d.sentimentScore <= -0.3 && d.sentimentScore > -0.7).length,
        data.filter(d => d.sentimentScore <= -0.7).length
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(132, 204, 22, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  };
};

/**
 * Extract common keywords from reviews
 * @param {Array} reviews - Array of review texts
 * @param {number} minCount - Minimum occurrence count
 * @returns {Array} Common keywords
 */
export const extractCommonKeywords = (reviews, minCount = 3) => {
  const wordCount = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

  reviews.forEach(review => {
    const words = review.toLowerCase().split(/\W+/);
    words.forEach(word => {
      if (word.length > 2 && !stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCount)
    .filter(([_, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
};

/**
 * Calculate sentiment trend over time
 * @param {Array} data - Time-series sentiment data
 * @returns {Object} Trend analysis
 */
export const calculateSentimentTrend = (data) => {
  if (!data || data.length < 2) {
    return { trend: 'stable', change: 0 };
  }

  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const first = sorted[0].score;
  const last = sorted[sorted.length - 1].score;
  const change = last - first;

  return {
    trend: change > 0.1 ? 'improving' : change < -0.1 ? 'declining' : 'stable',
    change: Math.abs(change).toFixed(2),
    percentage: first !== 0 ? ((change / first) * 100).toFixed(1) : '0'
  };
};

/**
 * Check if text contains personal information
 * @param {string} text - Input text
 * @returns {Object} Detection result
 */
export const detectPersonalInfo = (text) => {
  const patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/,
    creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/
  };

  const found = [];

  Object.entries(patterns).forEach(([type, pattern]) => {
    if (pattern.test(text)) {
      found.push(type);
    }
  });

  return {
    contains: found.length > 0,
    types: found,
    redacted: found.length > 0 ? redactPersonalInfo(text, found) : text
  };
};

/**
 * Redact personal information from text
 * @param {string} text - Input text
 * @param {Array} types - Types of info to redact
 * @returns {string} Redacted text
 */
const redactPersonalInfo = (text, types) => {
  let redacted = text;

  const patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/g
  };

  types.forEach(type => {
    if (patterns[type]) {
      redacted = redacted.replace(patterns[type], '[REDACTED]');
    }
  });

  return redacted;
};