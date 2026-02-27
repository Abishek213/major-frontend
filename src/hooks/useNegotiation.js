// src/hooks/useNegotiation.js
import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useNegotiation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [currentNegotiation, setCurrentNegotiation] = useState(null);

  // ============ ORGANIZER ACTIONS ============
  
  const submitOffer = useCallback(async (eventRequestId, offerData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Submitting offer for:', eventRequestId);
      
      const response = await api.safePost(`/negotiation/event-request/${eventRequestId}/start`, {
        proposedBudget: parseInt(offerData.proposedPrice),
        message: offerData.customMessage
      });
      
      console.log('📥 Submit offer response:', response.data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to submit offer');
      }
      
      return response.data;
      
    } catch (err) {
      console.error('❌ Submit offer error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ USER ACTIONS ============

  const submitCounterOffer = useCallback(async (negotiationId, counterOffer, message) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Submitting counter offer for:', negotiationId);
      
      const response = await api.safePost(`/negotiation/${negotiationId}/counter`, {
        counterOffer: parseInt(counterOffer),
        message
      });
      
      console.log('📥 Counter offer response:', response.data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to submit counter offer');
      }
      
      return response.data;
      
    } catch (err) {
      console.error('❌ Counter offer error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptOffer = useCallback(async (negotiationId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.safePost(`/negotiation/${negotiationId}/accept`, {});
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to accept offer');
      }
      
      return response.data;
      
    } catch (err) {
      console.error('❌ Accept offer error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectOffer = useCallback(async (negotiationId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.safePost(`/negotiation/${negotiationId}/reject`, {});
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to reject offer');
      }
      
      return response.data;
      
    } catch (err) {
      console.error('❌ Reject offer error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ SHARED ACTIONS ============

  const getPriceAnalysis = useCallback(async (eventType, location, budget) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.safeGet('/negotiation/price-analysis', {
        params: { eventType, location, budget }
      });
      
      console.log('📥 Price analysis response:', response.data);
      
      if (!response.data?.success) {
        return null;
      }
      
      return response.data.data || response.data;
      
    } catch (err) {
      console.error('❌ Price analysis error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNegotiationDetails = useCallback(async (negotiationId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.safeGet(`/negotiation/${negotiationId}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to get negotiation details');
      }
      
      setCurrentNegotiation(response.data.data?.negotiation || response.data.data);
      setNegotiationHistory(response.data.data?.negotiation?.negotiation_history || []);
      
      return response.data;
      
    } catch (err) {
      console.error('❌ Get negotiation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCompetitorAnalysis = useCallback(async (eventRequestId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.safeGet(`/negotiation/event-request/${eventRequestId}`);
      
      if (!response.data?.success) {
        return { competitors: [] };
      }
      
      const negotiations = response.data.data || [];
      const competitors = negotiations
        .filter(n => n.status === 'pending' || n.status === 'countered')
        .map(n => ({
          organizerName: n.metadata?.organizerName || 'Another Organizer',
          proposedPrice: n.initial_offer,
          status: n.status,
          round: n.negotiation_round
        }));
      
      return { competitors };
      
    } catch (err) {
      console.error('❌ Competitor analysis error:', err);
      return { competitors: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    negotiationHistory,
    currentNegotiation,
    submitOffer,
    submitCounterOffer,
    acceptOffer,
    rejectOffer,
    getPriceAnalysis,
    getNegotiationDetails,
    getCompetitorAnalysis,
  };
};