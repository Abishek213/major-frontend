// src/services/eventRequestService.js
import api from '../utils/api';

class EventRequestService {
  async processNaturalLanguageRequest(request, userId, context = {}) {
    try {
      console.log('📤 Sending to AI agent via backend:', { userId, request });

      // ========== MINIMAL PAYLOAD ==========
      // Just send the raw text to backend - let AI do the extraction
      const payload = {

        eventType: 'Pending AI Processing',
        venue: 'Not Specified',
        date: new Date(),
        budget: 0,
        userId: userId,
        naturalLanguage: request,
        useAI: true,
        description: request
      };

      console.log('📦 Sending payload to backend:', JSON.stringify(payload, null, 2));

      // ========== MAKE API CALL ==========
      const response = await api.safePost('/eventrequest', payload);

      console.log('📥 Backend response status:', response.status);
      console.log('📥 Backend response data:', response.data);

      if (!response.data || !response.data.success) {
        const errorMsg = response.data?.error || response.data?.message || 'Failed to create event request';
        console.error('❌ Backend error:', errorMsg);
        throw new Error(errorMsg);
      }

      // ========== USE ONLY AI DATA FROM BACKEND ==========
      const responseData = response.data.data;
      
      // This is the REAL AI data from your AI agent!
      const aiInsights = responseData.aiInsights || {};
      const extractedEntities = aiInsights.extractedEntities || {};
      
      console.log('🤖 AI extracted entities:', extractedEntities);

      // Format for display - ONLY use AI values, NO frontend extraction
      const transformedEntities = {
        // Use AI data directly
        eventType: extractedEntities.eventType || 'Not specified',
        location: extractedEntities.locations?.[0] || 'Not specified',
        date: extractedEntities.date || 'Not specified',
        budget: extractedEntities.budget ? `NPR ${extractedEntities.budget.toLocaleString()}` : 'Not specified',
        guestCount: extractedEntities.guests ? `${extractedEntities.guests} guests` : 'Not specified',
        // For UI badges/categories
        guestCategory: extractedEntities.guests ? (
          extractedEntities.guests < 50 ? 'Small (< 50)' : 
          extractedEntities.guests < 200 ? 'Medium (50-200)' : 
          'Large (> 200)'
        ) : 'Not specified',
        // Keep raw values for calculations
        rawBudget: extractedEntities.budget,
        rawGuests: extractedEntities.guests
      };

      const transformedOrganizers = (aiInsights.matchedOrganizers || []).map(org => ({
        id: org.id || org._id,
        name: org.name || org.fullname || 'Organizer',
        matchScore: org.matchPercentage || org.matchScore || 0,
        specialization: org.expertise?.[0] || 'Event Management',
        rating: org.rating || 4.0,
        completedEvents: org.pastEvents || org.completedEvents || 0,
        responseTime: org.responseTime || '24h',
        priceRange: org.priceRange || [0, 0],
        location: org.location || transformedEntities.location,
        verified: org.isVerified || false,
        email: org.email,
        contact: org.contact
      }));

      return {
        success: true,
        entities: transformedEntities,
        organizers: transformedOrganizers,
        budgetAnalysis: aiInsights.budgetAnalysis,
        suggestions: aiInsights.suggestions || aiInsights.aiSuggestions,
        requestId: responseData.eventRequest?._id || Date.now().toString(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Event request service error:', error);
      throw new Error(`Failed to process request: ${error.message}`);
    }
  }

  // Keep other methods unchanged
 // In eventRequestService.js, update the startNegotiation method:

async startNegotiation(eventRequestId, message, proposedBudget) {
  try {
    console.log('🚀 Starting negotiation via service:', { eventRequestId, proposedBudget });
    
    const response = await api.safePost(
      `/negotiation/event-request/${eventRequestId}/start`,
      {
        proposedBudget,
        message
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ Negotiation error:', error);
    throw error;
  }
}

  async getRequestHistory(userId) {
    try {
      const response = await api.safeGet('/eventrequest/event-requests-for-user');
      return response.data;
    } catch (error) {
      console.error('❌ Request history error:', error);
      return { eventRequests: [] };
    }
  }

  async trackRequestStatus(requestId) {
    try {
      const response = await api.safeGet(`/eventrequest/with-ai-insights/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Status tracking error:', error);
      throw error;
    }
  }
}

const eventRequestService = new EventRequestService();
export default eventRequestService;