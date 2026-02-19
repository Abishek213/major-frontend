// src/hooks/useOrganizerAI.js
import { useState, useCallback } from "react";
import organizerAIService from "../services/organizerAIService";

export const useOrganizerAI = (orgId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [tagRecommendations, setTagRecommendations] = useState([]);
  const [slotSuggestion, setSlotSuggestion] = useState(null);
  const [dateSuggestion, setDateSuggestion] = useState(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState(null);

  // NOTE: activeNegotiations polling was removed because /ai/organizer/offer-status/
  // does not exist in the backend. Add it back when the backend route is implemented.
  const [activeNegotiations] = useState([]);

  // ── Event Planning ────────────────────────────────────────────────────────

  const fetchPriceSuggestion = useCallback(async (eventData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getPriceSuggestion(eventData);
      setPriceSuggestion(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTagRecommendations = useCallback(async (description, category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getTagRecommendations(
        description,
        category
      );
      setTagRecommendations(data.tags || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSlotSuggestion = useCallback(async (location, category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getSlotSuggestion(
        location,
        category
      );
      setSlotSuggestion(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDateSuggestion = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getDateSuggestion(category);
      setDateSuggestion(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Negotiation ───────────────────────────────────────────────────────────

  const createOffer = useCallback(async (requestId, offerData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.createNegotiationOffer(
        requestId,
        offerData
      );
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompetitorAnalysis = useCallback(async (requestId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getCompetitorAnalysis(requestId);
      setCompetitorAnalysis(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Dashboard ─────────────────────────────────────────────────────────────

  const fetchDashboardMetrics = useCallback(
    async (timeframe = "month") => {
      if (!orgId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await organizerAIService.getDashboardMetrics(
          orgId,
          timeframe
        );
        setDashboardMetrics(data);
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [orgId]
  );

  const fetchSentimentAnalysis = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getSentimentAnalysis(orgId);
      setSentimentData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  return {
    loading,
    error,
    dashboardMetrics,
    sentimentData,
    priceSuggestion,
    tagRecommendations,
    slotSuggestion,
    dateSuggestion,
    activeNegotiations,
    competitorAnalysis,
    // Event Planning
    fetchPriceSuggestion,
    fetchTagRecommendations,
    fetchSlotSuggestion,
    fetchDateSuggestion,
    // Negotiation
    createOffer,
    fetchCompetitorAnalysis,
    // Dashboard
    fetchDashboardMetrics,
    fetchSentimentAnalysis,
  };
};

// ── useEventPlanning ──────────────────────────────────────────────────────────

export const useEventPlanning = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestions = async (eventData) => {
    setLoading(true);
    setError(null);
    try {
      const [price, tags, slots, date] = await Promise.all([
        organizerAIService.getPriceSuggestion(eventData),
        organizerAIService.getTagRecommendations(
          eventData.description,
          eventData.category
        ),
        organizerAIService.getSlotSuggestion(
          eventData.location,
          eventData.category
        ),
        organizerAIService.getDateSuggestion(eventData.category),
      ]);
      setSuggestions({
        price: price.suggestedPrice,
        tags: tags.tags,
        slots: slots.suggestedSlots,
        date: date.suggestedDates,
      });
      return { price, tags, slots, date };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, loading, error, getSuggestions };
};

// ── useNegotiation ────────────────────────────────────────────────────────────

export const useNegotiation = (requestId) => {
  const [offers, setOffers] = useState([]);
  const [competitors, setCompetitors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitOffer = async (offerData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.createNegotiationOffer(
        requestId,
        offerData
      );
      setOffers((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCompetitorAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getCompetitorAnalysis(requestId);
      setCompetitors(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    offers,
    competitors,
    loading,
    error,
    submitOffer,
    getCompetitorAnalysis,
  };
};
