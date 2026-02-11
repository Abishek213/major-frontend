import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import recommendationService from '../services/recommendationService';

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    location: '',
    dateRange: null
  });

  const fetchRecommendations = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await recommendationService.getRecommendations(
        user.id,
        preferences,
        forceRefresh
      );
      setRecommendations(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations');
      console.error('Error fetching recommendations:', err);
      
      // For development, use mock data
      if (import.meta.env.MODE === 'development') {
        setRecommendations(recommendationService.getMockRecommendations());
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, preferences]);

  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  const refreshRecommendations = useCallback(() => {
    fetchRecommendations(true);
  }, [fetchRecommendations]);

  const rateRecommendation = useCallback(async (eventId, rating) => {
    if (!user?.id) return;
    
    try {
      await recommendationService.rateRecommendation(
        user.id,
        eventId,
        rating
      );
      // Update local state
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === eventId 
            ? { ...rec, userRating: rating }
            : rec
        )
      );
    } catch (err) {
      console.error('Error rating recommendation:', err);
      // Still update UI even if API fails in development
      if (import.meta.env.MODE === 'development') {
        setRecommendations(prev => 
          prev.map(rec => 
            rec.id === eventId 
              ? { ...rec, userRating: rating }
              : rec
          )
        );
      }
    }
  }, [user?.id]);

  const getRecommendationInsights = useCallback(() => {
    if (recommendations.length === 0) return null;
    
    const categories = [...new Set(recommendations.map(r => r.category))];
    const avgMatchScore = recommendations.reduce((acc, r) => acc + (r.matchScore || 0), 0) / recommendations.length;
    
    return {
      total: recommendations.length,
      categories,
      avgMatchScore: Math.round(avgMatchScore),
      lastUpdated: new Date().toLocaleTimeString()
    };
  }, [recommendations]);

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [user?.id, fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    preferences,
    updatePreferences,
    refreshRecommendations,
    rateRecommendation,
    getRecommendationInsights,
    fetchRecommendations
  };
};