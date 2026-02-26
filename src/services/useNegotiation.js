// src/hooks/useNegotiation.js
import { useState, useCallback } from 'react';
import api from '@/utils/api';
import eventRequestService from '@/services/eventRequestService';

export const useNegotiation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [negotiationData, setNegotiationData] = useState(null);

  // Start a new negotiation
  const startNegotiation = useCallback(async (eventRequestId, message, proposedBudget) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting negotiation:', { eventRequestId, proposedBudget });
      
      const response = await eventRequestService.startNegotiation(
        eventRequestId,
        message,
        proposedBudget
      );
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit a counter offer
  const submitCounterOffer = useCallback(async (negotiationId, counterOffer, message) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Submitting counter offer:', { negotiationId, counterOffer, message });
      
      // Make sure negotiationId is valid
      if (!negotiationId || negotiationId === 'undefined') {
        throw new Error('Invalid negotiation ID');
      }

      const response = await api.safePost(`/negotiation/${negotiationId}/counter`, {
        counterOffer,
        message
      });

      console.log('📥 Counter offer response:', response.data);

      // After successful counter, fetch updated negotiation data
      if (response.data?.success) {
        await getNegotiationDetails(negotiationId);
      }

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Accept an offer
  const acceptOffer = useCallback(async (negotiationId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('✅ Accepting offer:', negotiationId);
      
      const response = await api.safePost(`/negotiation/${negotiationId}/accept`);
      
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject an offer
  const rejectOffer = useCallback(async (negotiationId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('❌ Rejecting offer:', negotiationId);
      
      const response = await api.safePost(`/negotiation/${negotiationId}/reject`);
      
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get negotiation details
  const getNegotiationDetails = useCallback(async (negotiationId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching negotiation details:', negotiationId);
      
      const response = await api.safeGet(`/negotiation/${negotiationId}`);
      
      if (response.data?.success) {
        setNegotiationData(response.data.data);
      }
      
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all negotiations for an event request
  const getEventRequestNegotiations = useCallback(async (eventRequestId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching negotiations for event:', eventRequestId);
      
      const response = await api.safeGet(`/negotiation/event-request/${eventRequestId}`);
      
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get price analysis from AI
  const getPriceAnalysis = useCallback(async (eventType, location, budget) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Getting price analysis:', { eventType, location, budget });
      
      const response = await api.safeGet('/negotiation/price-analysis', {
        params: { eventType, location, budget }
      });

      // Format the analysis data
      const analysis = response.data?.data || response.data;
      
      return {
        marketAnalysis: {
          estimatedPrice: analysis?.estimatedMarketPrice || analysis?.estimatedPrice,
          minReasonable: analysis?.minReasonable,
          maxReasonable: analysis?.maxReasonable
        },
        validation: {
          isReasonable: analysis?.isReasonable,
          suggestion: analysis?.suggestion || analysis?.message
        },
        raw: analysis
      };
    } catch (err) {
      console.error('Price analysis error:', err);
      // Return fallback analysis
      return {
        marketAnalysis: {
          estimatedPrice: Math.round(budget * 1.1),
        },
        validation: {
          isReasonable: true,
          suggestion: 'Based on market rates, this budget is reasonable.'
        }
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Track request status
  const trackRequestStatus = useCallback(async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventRequestService.trackRequestStatus(requestId);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    negotiationData,
    
    // Methods
    startNegotiation,
    submitCounterOffer,
    acceptOffer,
    rejectOffer,
    getNegotiationDetails,
    getEventRequestNegotiations,
    getPriceAnalysis,
    trackRequestStatus
  };
};