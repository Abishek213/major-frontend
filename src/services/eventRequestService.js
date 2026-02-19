import api from '../utils/api';

// ─── Base path ────────────────────────────────────────────────────────────────
// Server mounts this router at: /api/v1/eventrequest  (see server.js)
// api.js baseURL should be set via VITE_API_URL env var, e.g.:
//   VITE_API_URL=http://localhost:5000/api/v1
// So BASE = '/eventrequest' resolves to: http://localhost:5000/api/v1/eventrequest
const BASE = '/eventrequest';

class EventRequestService {
  /**
   * Submit a natural language event request to the backend with AI processing.
   * Calls POST /api/v1/eventrequest with useAI: true so the controller runs
   * callAIAgent() and returns matchedOrganizers + budgetAnalysis.
   *
   * @param {string}  naturalLanguage  - Free-text description from the user
   * @param {string}  userId           - Authenticated user ID
   * @param {Object}  extraFields      - Optional structured fields (eventType, venue, …)
   * @returns {Object} { success, message, data: { eventRequest, aiInsights } }
   */
  async processNaturalLanguageRequest(naturalLanguage, userId, extraFields = {}) {
    try {
      const payload = {
        useAI: true,
        naturalLanguage,
        // Sensible defaults so the EventRequest schema is satisfied;
        // the AI service extracts richer values from naturalLanguage on the backend.
        eventType:   extraFields.eventType   || 'General',
        venue:       extraFields.venue       || 'TBD',
        date:        extraFields.date        || new Date().toISOString(),
        budget:      extraFields.budget      || 0,
        description: naturalLanguage,
        ...extraFields
      };

      // POST /api/v1/eventrequest
      const response = await api.safePost(BASE, payload);
      return response.data; // { success, message, data: { eventRequest, aiInsights } }
    } catch (error) {
      console.error('Event request service error:', error);

      if (import.meta.env.MODE === 'development') {
        return this._mockProcessedRequest(naturalLanguage);
      }

      throw error;
    }
  }

  /**
   * Fetch AI insights stored on an event request.
   * GET /api/v1/eventrequest/with-ai-insights/:id
   */
  async getEventRequestWithAIInsights(requestId) {
    try {
      const response = await api.safeGet(`${BASE}/with-ai-insights/${requestId}`);
      return response.data; // { success, data: { eventRequest, interestedOrganizers, aiInsights } }
    } catch (error) {
      console.error('AI insights fetch error:', error);

      if (import.meta.env.MODE === 'development') {
        return { success: false, data: null };
      }

      throw error;
    }
  }

  /**
   * Get AI-suggested organizers for an already-created event request.
   * GET /api/v1/eventrequest/ai-suggestions/:id
   */
  async getAISuggestedOrganizers(requestId) {
    try {
      const response = await api.safeGet(`${BASE}/ai-suggestions/${requestId}`);
      return response.data; // { success, data: { aiEnabled, filteredSuggestions, … } }
    } catch (error) {
      console.error('AI organizer suggestion error:', error);

      if (import.meta.env.MODE === 'development') {
        return {
          success: true,
          data: { aiEnabled: false, filteredSuggestions: this._mockOrganizers() }
        };
      }

      throw error;
    }
  }

  /**
   * Trigger a fresh AI reprocessing pass on an existing event request.
   * POST /api/v1/eventrequest/reprocess-with-ai/:id
   */
  async reprocessWithAI(requestId, naturalLanguage = null) {
    try {
      const response = await api.safePost(
        `${BASE}/reprocess-with-ai/${requestId}`,
        { naturalLanguage }
      );
      return response.data;
    } catch (error) {
      console.error('AI reprocess error:', error);
      throw error;
    }
  }

  // ─── Legacy helpers kept for backward compatibility ───────────────────────────

  async sendRequestToOrganizers(requestId, organizerIds) {
    try {
      const response = await api.safePost('/ai/send-request', { requestId, organizerIds });
      return response.data;
    } catch (error) {
      console.error('Request sending error:', error);
      throw error;
    }
  }

  /**
   * Fetch all event requests for the logged-in user.
   * GET /api/v1/eventrequest/event-requests-for-user
   */
  async getRequestHistory(userId) {
    try {
      const response = await api.safeGet(`${BASE}/event-requests-for-user`);
      return response.data;
    } catch (error) {
      console.error('Request history error:', error);
      if (import.meta.env.MODE === 'development') return [];
      throw error;
    }
  }

  // ─── Mock data (development fallbacks) ───────────────────────────────────────

  _mockProcessedRequest(text) {
    return {
      success: true,
      message: '[DEV] Mock response — backend not reachable',
      data: {
        eventRequest: { _id: `mock_${Date.now()}`, description: text, status: 'open' },
        aiInsights: {
          enabled: true,
          matchedOrganizers: this._mockOrganizers(),
          budgetAnalysis: { feasibility: 'moderate', note: 'Mock analysis' },
          suggestions: { tip: 'Book at least 4 weeks in advance' }
        }
      }
    };
  }

  _mockOrganizers() {
    return [
      {
        id: 1,
        name: 'Tech Events Co.',
        matchScore: 95,
        specialization: 'Technology Conferences',
        experience: '5+ years',
        rating: 4.8,
        previousEvents: ['AI Summit 2023', 'DevCon 2024'],
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
        previousEvents: ['Business Expo 2023', 'Startup Weekend'],
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
        previousEvents: ['Digital Marketing Conference', 'Web3 Workshop'],
        responseTime: '< 2 hours',
        completedEvents: 35,
        successRate: '96%'
      }
    ];
  }
}

const eventRequestService = new EventRequestService();

export { EventRequestService };
export default eventRequestService;