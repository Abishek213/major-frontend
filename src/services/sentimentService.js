import api from '../utils/api';

class SentimentService {
  async analyzeText(text) {
    try {
      const response = await api.post('/ai/sentiment/analyze', { text });
      return response.data;
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  async getReviewSentiment(reviewId) {
    try {
      const response = await api.get(`/ai/sentiment/review/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting review sentiment:', error);
      throw error;
    }
  }

  async getEventSentimentSummary(eventId) {
    try {
      const response = await api.get(`/ai/sentiment/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting event sentiment:', error);
      throw error;
    }
  }

  async extractKeywords(text) {
    try {
      const response = await api.post('/ai/sentiment/keywords', { text });
      return response.data;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      throw error;
    }
  }

  async checkToxicity(text) {
    try {
      const response = await api.post('/ai/sentiment/toxicity', { text });
      return response.data;
    } catch (error) {
      console.error('Error checking toxicity:', error);
      throw error;
    }
  }

  async getActionableInsights(eventId) {
    try {
      const response = await api.get(`/ai/sentiment/insights/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting actionable insights:', error);
      throw error;
    }
  }
}

export default new SentimentService();