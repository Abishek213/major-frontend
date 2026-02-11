import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

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
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      const mockRecommendations = [
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
      
      setRecommendations(mockRecommendations);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [user, preferences]);

  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  const refreshRecommendations = useCallback(() => {
    fetchRecommendations(true);
  }, [fetchRecommendations]);

  const rateRecommendation = useCallback(async (eventId, rating) => {
    try {
      // Mock API call for rating
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Rated event ${eventId} with ${rating} stars`);
      
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
      throw err;
    }
  }, []);

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
    if (user) {
      fetchRecommendations();
    }
  }, [user, fetchRecommendations]);

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