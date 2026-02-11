import api from '../utils/api';

class RecommendationService {
  async getRecommendations(userId, preferences = {}, forceRefresh = false) {
    try {
      const response = await api.safePost('/ai/recommendations', {
        userId,
        preferences,
        forceRefresh
      });
      return response.data;
    } catch (error) {
      console.error('Recommendation service error:', error);
      
      // Return mock data for development
      if (import.meta.env.MODE === 'development') {
        return this.getMockRecommendations();
      }
      
      throw error;
    }
  }

  async rateRecommendation(userId, eventId, rating) {
    try {
      const response = await api.safePost('/ai/recommendations/rate', {
        userId,
        eventId,
        rating
      });
      return response.data;
    } catch (error) {
      console.error('Rating error:', error);
      
      // Mock successful rating for development
      if (import.meta.env.MODE === 'development') {
        return { success: true, message: 'Rating saved' };
      }
      
      throw error;
    }
  }

  async updatePreferences(userId, preferences) {
    try {
      const response = await api.safePut('/ai/recommendations/preferences', {
        userId,
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Preferences update error:', error);
      throw error;
    }
  }

  async getRecommendationInsights(userId) {
    try {
      const response = await api.safeGet(`/ai/recommendations/insights/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Insights error:', error);
      
      // Mock insights for development
      if (import.meta.env.MODE === 'development') {
        return {
          totalEvents: 45,
          categories: ['Technology', 'Music', 'Business'],
          avgMatchScore: 87,
          lastUpdated: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }

  // Mock data for development
  getMockRecommendations() {
    return [
      {
        id: 101,
        title: "AI-Picked: Tech Networking Based on Your Profile",
        category: "AI Recommended",
        date: "Fri, Jan 15",
        time: "6:00 PM",
        location: "Tech Hub Center",
        price: "$25.00",
        promoted: false,
        goingFast: true,
        salesEndSoon: false,
        tags: ["ai-recommended", "today"],
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop",
        aiReason: "Matches your interest in technology and networking events",
        matchScore: 95
      },
      {
        id: 102,
        title: "Curated for You: Advanced JavaScript Workshop",
        category: "AI Recommended",
        date: "Sat, Jan 16",
        time: "10:00 AM",
        location: "Online",
        price: "$49.99",
        promoted: false,
        goingFast: false,
        salesEndSoon: true,
        tags: ["ai-recommended", "online"],
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&h=300&fit=crop",
        aiReason: "Based on your past programming workshop attendance",
        matchScore: 88
      }
    ];
  }
}

export default new RecommendationService();