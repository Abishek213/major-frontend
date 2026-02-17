// src/services/organizerAIService.js
import api from '../utils/api';

// Add development flag at the top
const IS_DEV = process.env.NODE_ENV === 'development';

class OrganizerAIService {
  // ============================================
  // EVENT PLANNING AGENT SERVICES
  // ============================================

  async getPriceSuggestion(eventData) {
    try {
      const response = await api.post('/ai/organizer/price-suggestion', {
        category: eventData.category,
        location: eventData.location,
        eventDate: eventData.eventDate,
        description: eventData.description
      });
      return response.data;
    } catch (error) {
      // Only log errors in production
      if (!IS_DEV) {
        console.error('Error getting price suggestion:', error);
      }
      return this.getMockPriceSuggestion(eventData);
    }
  }

  getMockPriceSuggestion(eventData) {
    const basePrice = 50;
    const categoryMultiplier = {
      'conference': 2.5,
      'workshop': 1.8,
      'concert': 3.0,
      'sports': 2.2,
      'networking': 1.5,
      'default': 2.0
    };

    const multiplier = categoryMultiplier[eventData?.category?.toLowerCase()] || categoryMultiplier.default;
    const suggestedPrice = Math.round(basePrice * multiplier * (0.9 + Math.random() * 0.3));

    return {
      suggestedPrice,
      priceRange: {
        min: Math.round(suggestedPrice * 0.8),
        max: Math.round(suggestedPrice * 1.2)
      },
      marketAverage: Math.round(suggestedPrice * 0.95),
      demandScore: 0.6 + Math.random() * 0.3,
      confidence: Math.floor(75 + Math.random() * 20)
    };
  }

  async getTagRecommendations(description, category) {
    try {
      const response = await api.post('/ai/organizer/tag-recommendations', {
        description,
        category
      });
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error getting tag recommendations:', error);
      }
      return this.getMockTagRecommendations(category);
    }
  }

  getMockTagRecommendations(category) {
    const categoryTags = {
      'conference': ['tech', 'business', 'networking', 'innovation', 'keynote', 'workshop'],
      'workshop': ['hands-on', 'learning', 'training', 'skills', 'practical', 'interactive'],
      'concert': ['live-music', 'performance', 'band', 'tour', 'live', 'music-festival'],
      'sports': ['game', 'tournament', 'competition', 'sports', 'athlete', 'championship'],
      'networking': ['business', 'professional', 'connect', 'meetup', 'social', 'career'],
      'default': ['event', 'community', 'special', 'featured', 'popular', 'trending']
    };

    const tags = categoryTags[category?.toLowerCase()] || categoryTags.default;
    
    return {
      tags: tags.map((tag, index) => ({
        name: tag,
        popularity: Math.floor(50 + Math.random() * 50),
        relevance: Math.floor(70 + Math.random() * 30)
      })),
      suggested: tags.slice(0, 3)
    };
  }

  async getSlotSuggestion(location, category) {
    try {
      const response = await api.post('/ai/organizer/slot-suggestion', {
        location,
        category
      });
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error getting slot suggestion:', error);
      }
      return this.getMockSlotSuggestion(location, category);
    }
  }

  getMockSlotSuggestion(location, category) {
    const baseSlots = {
      'conference': 200,
      'workshop': 50,
      'concert': 500,
      'sports': 1000,
      'networking': 100,
      'default': 150
    };

    const suggestedSlots = (baseSlots[category?.toLowerCase()] || baseSlots.default) * (0.8 + Math.random() * 0.4);
    
    return {
      suggestedSlots: Math.round(suggestedSlots),
      minRecommended: Math.round(suggestedSlots * 0.7),
      maxRecommended: Math.round(suggestedSlots * 1.3),
      reason: `Based on similar events in ${location || 'your area'}`,
      confidence: Math.floor(70 + Math.random() * 25)
    };
  }

  async getDateSuggestion(category) {
    try {
      const response = await api.get(`/ai/organizer/date-suggestion/${category}`);
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error getting date suggestion:', error);
      }
      return this.getMockDateSuggestion(category);
    }
  }

  getMockDateSuggestion(category) {
    const today = new Date();
    const suggestions = [];
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + (i * 7) + Math.floor(Math.random() * 3));
      
      suggestions.push({
        date: date.toISOString().split('T')[0],
        confidence: Math.floor(70 + Math.random() * 25),
        reason: i === 1 ? 'Optimal for weekend attendance' : 
                i === 2 ? 'Good for industry calendar' : 
                'Avoids major holidays'
      });
    }

    return {
      suggestedDates: suggestions,
      bestDayOfWeek: ['Friday', 'Saturday', 'Sunday'][Math.floor(Math.random() * 3)],
      seasonalFactor: Math.random() * 0.5 + 0.5
    };
  }

  // ============================================
  // NEGOTIATION AGENT SERVICES
  // ============================================

  async createNegotiationOffer(requestId, offerData) {
    try {
      const response = await api.post(`/ai/organizer/negotiation/${requestId}`, {
        proposedPrice: offerData.proposedPrice,
        proposedDate: offerData.proposedDate,
        customMessage: offerData.customMessage
      });
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error creating negotiation offer:', error);
      }
      return {
        success: true,
        offerId: 'mock_' + Date.now(),
        status: 'pending',
        message: 'Offer submitted successfully (mock)'
      };
    }
  }

  async getCompetitorAnalysis(requestId) {
    try {
      const response = await api.get(`/ai/organizer/competitor-analysis/${requestId}`);
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error getting competitor analysis:', error);
      }
      return this.getMockCompetitorAnalysis();
    }
  }

  getMockCompetitorAnalysis() {
    const competitors = [
      {
        organizerName: 'Elite Events Co.',
        proposedPrice: 4500,
        proposedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        experience: 45,
        rating: 4.8,
        strengths: ['Premium service', 'Experienced team']
      },
      {
        organizerName: 'Budget Planners',
        proposedPrice: 2800,
        proposedDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        experience: 12,
        rating: 4.2,
        strengths: ['Affordable', 'Flexible']
      },
      {
        organizerName: 'Creative Solutions',
        proposedPrice: 3800,
        proposedDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        experience: 28,
        rating: 4.6,
        strengths: ['Innovative ideas', 'Good reviews']
      }
    ];

    const marketAvg = competitors.reduce((sum, c) => sum + c.proposedPrice, 0) / competitors.length;

    return {
      analysis: {
        winProbability: Math.floor(50 + Math.random() * 40),
        marketAverage: Math.round(marketAvg),
        yourRank: Math.floor(Math.random() * 3) + 1,
        totalCompetitors: competitors.length,
        insights: [
          {
            type: 'warning',
            message: 'Your price is above market average by 15%'
          },
          {
            type: 'positive',
            message: 'You have the highest rating among competitors'
          },
          {
            type: 'info',
            message: 'Consider offering early-bird discounts'
          }
        ],
        suggestedPrice: Math.round(marketAvg * 0.95),
        recommendation: 'Focus on your experience and quality to justify premium pricing'
      },
      competitors
    };
  }

  async getOfferStatus(requestId) {
    try {
      const response = await api.get(`/ai/organizer/offer-status/${requestId}`);
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error getting offer status:', error);
      }
      return {
        negotiations: [
          {
            id: 'mock_1',
            requestId: requestId,
            status: 'pending',
            proposedPrice: 3500,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
    }
  }

  // ============================================
  // ORGANIZER DASHBOARD ASSISTANT SERVICES
  // ============================================

  async getDashboardMetrics(orgId, timeframe = 'month') {
    try {
      const response = await api.get(`/ai/organizer/dashboard/${orgId}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error getting dashboard metrics:', error);
      }
      // Still log a friendly message in development so you know mock data is being used
      if (IS_DEV) {
        console.log('📊 Using mock dashboard metrics for org:', orgId);
      }
      return this.getMockDashboardMetrics(orgId, timeframe);
    }
  }

  getMockDashboardMetrics(orgId, timeframe) {
    const events = [
      { name: 'Tech Conference 2024', attendees: 245, totalSlots: 300, revenue: 36750, rating: 4.8 },
      { name: 'JavaScript Workshop', attendees: 45, totalSlots: 50, revenue: 2250, rating: 4.6 },
      { name: 'Startup Networking', attendees: 78, totalSlots: 100, revenue: 1170, rating: 4.7 },
      { name: 'AI Summit', attendees: 156, totalSlots: 200, revenue: 23400, rating: 4.9 }
    ];

    const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
    const totalBookings = events.reduce((sum, e) => sum + e.attendees, 0);
    const totalEvents = events.length;
    const totalReviews = events.reduce((sum, e) => sum + Math.floor(e.attendees * 0.3), 0);
    const averageRating = events.reduce((sum, e) => sum + e.rating, 0) / totalEvents;

    return {
      totalRevenue,
      totalBookings,
      totalEvents,
      totalReviews,
      averageRating,
      revenueTrend: Math.floor(Math.random() * 20) + 5,
      bookingTrend: Math.floor(Math.random() * 15) + 3,
      conversionTrend: Math.floor(Math.random() * 10) + 2,
      conversionRate: Math.floor(Math.random() * 30) + 60,
      events: events.map(e => ({
        ...e,
        attendanceRate: Math.round((e.attendees / e.totalSlots) * 100)
      })),
      timeframe
    };
  }

  async getEventPerformance(orgId, eventId = null) {
    try {
      const url = eventId 
        ? `/ai/organizer/event-performance/${orgId}/${eventId}`
        : `/ai/organizer/event-performance/${orgId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error getting event performance:', error);
      }
      if (IS_DEV) {
        console.log('📈 Using mock event performance for org:', orgId);
      }
      return {
        events: [
          {
            id: 'event1',
            name: 'Tech Conference 2024',
            revenue: 36750,
            bookings: 245,
            capacity: 300,
            rating: 4.8,
            trends: {
              daily: [45, 52, 48, 61, 55, 58, 62],
              weekly: [245, 268, 289, 301]
            }
          }
        ]
      };
    }
  }

  async getSentimentAnalysis(orgId) {
    try {
      const response = await api.get(`/ai/organizer/sentiment/${orgId}`);
      return response.data;
    } catch (error) {
      if (!IS_DEV) {
        console.error('Error getting sentiment analysis:', error);
      }
      if (IS_DEV) {
        console.log('😊 Using mock sentiment analysis for org:', orgId);
      }
      return this.getMockSentimentAnalysis();
    }
  }

  getMockSentimentAnalysis() {
    const positive = Math.floor(60 + Math.random() * 25);
    const neutral = Math.floor(10 + Math.random() * 20);
    const negative = 100 - positive - neutral;

    return {
      overallSentiment: (positive / 100) * 0.8 + 0.2,
      sentimentLabel: positive > 70 ? 'Very Positive' : positive > 50 ? 'Positive' : 'Mixed',
      distribution: {
        positive,
        neutral,
        negative
      },
      topKeywords: ['great', 'organized', 'informative', 'engaging', 'professional', 'valuable'],
      insights: [
        'Attendees appreciate the quality of speakers',
        'Venue location is convenient for most',
        'Consider adding more networking time',
        'Food quality feedback is consistently positive'
      ],
      trends: [
        { date: 'Mon', score: 0.75 },
        { date: 'Tue', score: 0.78 },
        { date: 'Wed', score: 0.82 },
        { date: 'Thu', score: 0.79 },
        { date: 'Fri', score: 0.85 },
        { date: 'Sat', score: 0.88 },
        { date: 'Sun', score: 0.86 }
      ]
    };
  }
}

// Create and export the instance
const organizerAIService = new OrganizerAIService();
export default organizerAIService;