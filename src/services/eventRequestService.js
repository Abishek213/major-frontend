import api from '../utils/api';

class EventRequestService {
  async processNaturalLanguageRequest(request, userId, context = {}) {
    try {
      const response = await api.safePost('/ai/event-request', {
        request,
        userId,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Event request service error:', error);
      
      // Return mock data for development
      if (import.meta.env.MODE === 'development') {
        return this.getMockProcessedRequest(request);
      }
      
      throw error;
    }
  }

  async extractEntities(text) {
    try {
      const response = await api.safePost('/ai/extract-entities', { text });
      return response.data;
    } catch (error) {
      console.error('Entity extraction error:', error);
      
      // Mock extraction for development
      if (import.meta.env.MODE === 'development') {
        return this.getMockEntities(text);
      }
      
      throw error;
    }
  }

  async findMatchingOrganizers(criteria) {
    try {
      const response = await api.safePost('/ai/match-organizers', criteria);
      return response.data;
    } catch (error) {
      console.error('Organizer matching error:', error);
      
      // Mock organizers for development
      if (import.meta.env.MODE === 'development') {
        return this.getMockOrganizers();
      }
      
      throw error;
    }
  }

  async sendRequestToOrganizers(requestId, organizerIds) {
    try {
      const response = await api.safePost('/ai/send-request', {
        requestId,
        organizerIds
      });
      return response.data;
    } catch (error) {
      console.error('Request sending error:', error);
      throw error;
    }
  }

  async getRequestHistory(userId) {
    try {
      const response = await api.safeGet(`/ai/request-history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Request history error:', error);
      
      // Mock history for development
      if (import.meta.env.MODE === 'development') {
        return [];
      }
      
      throw error;
    }
  }

  async trackRequestStatus(requestId) {
    try {
      const response = await api.safeGet(`/ai/request-status/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Status tracking error:', error);
      throw error;
    }
  }

  // Mock data for development
  getMockProcessedRequest(request) {
    return {
      entities: this.getMockEntities(request),
      organizers: this.getMockOrganizers(),
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
  }

  getMockEntities(text) {
    return {
      eventType: text.includes('tech') ? 'Technology' : 
                text.includes('music') ? 'Music' : 
                text.includes('business') ? 'Business' : 
                text.includes('wedding') ? 'Wedding' :
                text.includes('sports') ? 'Sports' :
                text.includes('educational') ? 'Educational' : 'General',
      location: text.includes('kathmandu') ? 'Kathmandu' : 
                text.includes('pokhara') ? 'Pokhara' :
                text.includes('online') ? 'Online' : 'Not specified',
      date: text.includes('next month') ? 'Next Month' : 
            text.includes('next week') ? 'Next Week' :
            text.includes('weekend') ? 'This Weekend' : 
            text.includes('today') ? 'Today' : 'Flexible',
      budget: text.includes('free') ? 'Free' : 
              text.includes('$') ? 'Paid' : 'Not specified',
      attendees: text.includes('small') ? 'Small (< 50)' : 
                text.includes('large') ? 'Large (> 200)' : 
                text.includes('50') ? '50' :
                text.includes('100') ? '100' : 'Medium (50-200)',
      keywords: text.toLowerCase().split(' ').filter(word => 
        ['tech', 'music', 'business', 'workshop', 'seminar', 'festival', 
         'wedding', 'sports', 'conference', 'meetup', 'party', 'concert'].includes(word)
      )
    };
  }

  getMockOrganizers() {
    return [
      {
        id: 1,
        name: 'Tech Events Co.',
        matchScore: 95,
        specialization: 'Technology Conferences',
        experience: '5+ years',
        rating: 4.8,
        previousEvents: ['AI Summit 2023', 'DevCon 2024', 'TechFest 2023'],
        contact: 'tech@events.com',
        responseTime: '< 1 hour',
        completedEvents: 47,
        successRate: '98%'
      },
      {
        id: 2,
        name: 'Kathmandu Event Planners',
        matchScore: 88,
        specialization: 'Local Business Events',
        experience: '3+ years',
        rating: 4.5,
        previousEvents: ['Business Expo 2023', 'Startup Weekend', 'Networking Night'],
        contact: 'info@kathmanduevents.com',
        responseTime: '< 3 hours',
        completedEvents: 28,
        successRate: '95%'
      },
      {
        id: 3,
        name: 'Digital Summit Organizers',
        matchScore: 82,
        specialization: 'Online Tech Events',
        experience: '4+ years',
        rating: 4.7,
        previousEvents: ['Digital Marketing Conference', 'Web3 Workshop', 'Virtual Summit 2024'],
        contact: 'hello@digitalsummit.com',
        responseTime: '< 2 hours',
        completedEvents: 35,
        successRate: '96%'
      }
    ];
  }
}

// Create an instance of the service
const eventRequestService = new EventRequestService();

// Export both the class and the default instance
export { EventRequestService };
export default eventRequestService;