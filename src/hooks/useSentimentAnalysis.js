import { useState, useCallback } from 'react';
import sentimentService from '../services/sentimentService';

export const useSentimentAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sentimentResult, setSentimentResult] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [toxicityResult, setToxicityResult] = useState(null);

  const analyzeText = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sentimentService.analyzeText(text);
      setSentimentResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const extractKeywordsFromText = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sentimentService.extractKeywords(text);
      setKeywords(data.keywords || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkTextToxicity = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sentimentService.checkToxicity(text);
      setToxicityResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviewSentiment = useCallback(async (reviewId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sentimentService.getReviewSentiment(reviewId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventSentimentSummary = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sentimentService.getEventSentimentSummary(eventId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActionableInsights = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sentimentService.getActionableInsights(eventId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    sentimentResult,
    keywords,
    toxicityResult,
    analyzeText,
    extractKeywordsFromText,
    checkTextToxicity,
    getReviewSentiment,
    getEventSentimentSummary,
    getActionableInsights
  };
};