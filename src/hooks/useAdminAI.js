// src/hooks/useAdminAI.js
import { useState, useEffect, useCallback } from 'react';
import adminAIService from '../services/adminAIService'; // This will now work with default export

export const useAdminAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [sentimentOverview, setSentimentOverview] = useState(null);
  const [toxicityAlerts, setToxicityAlerts] = useState([]);

  // Fraud Detection Functions
  const fetchFraudAlerts = useCallback(async (status = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getFraudAlerts(status);
      // Handle both direct response and response.data format
      const alerts = response.alerts || response.data?.alerts || [];
      setFraudAlerts(alerts);
      return response;
    } catch (err) {
      console.error('Error in fetchFraudAlerts:', err);
      setError(err.message);
      // Set mock data on error
      setFraudAlerts([
        {
          id: 1,
          type: 'Multiple Failed Logins',
          severity: 'high',
          description: '10 failed login attempts in 5 minutes',
          user: 'user123',
          ip: '192.168.1.100',
          location: 'Unknown VPN',
          time: '2 minutes ago',
          status: 'new',
          riskScore: 0.94
        },
        {
          id: 2,
          type: 'Suspicious Purchase Pattern',
          severity: 'medium',
          description: 'Bulk ticket purchase with multiple credit cards',
          user: 'eventbuyer',
          ip: '203.0.113.45',
          location: 'New York, US',
          time: '15 minutes ago',
          status: 'investigating',
          riskScore: 0.76
        }
      ]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const blockBooking = useCallback(async (bookingId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.blockSuspiciousBooking(bookingId, reason);
      return response;
    } catch (err) {
      console.error('Error in blockBooking:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId, action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.resolveFraudAlert(alertId, action);
      // Update local state
      setFraudAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved', resolution: action }
            : alert
        )
      );
      return response;
    } catch (err) {
      console.error('Error in resolveAlert:', err);
      setError(err.message);
      // Still update local state
      setFraudAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved', resolution: action }
            : alert
        )
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analytics Functions
  const fetchPlatformAnalytics = useCallback(async (timeframe = 'month') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getPlatformAnalytics(timeframe);
      setPlatformAnalytics(response);
      return response;
    } catch (err) {
      console.error('Error in fetchPlatformAnalytics:', err);
      setError(err.message);
      // Set mock data
      setPlatformAnalytics({
        totalUsers: 15234,
        totalEvents: 2341,
        totalBookings: 12456,
        totalRevenue: 456789,
        userGrowth: 15,
        eventGrowth: 12,
        bookingGrowth: 18,
        revenueGrowth: 22,
        categoryDistribution: [
          { name: 'Music', count: 845, percentage: 36 },
          { name: 'Technology', count: 623, percentage: 27 },
          { name: 'Business', count: 456, percentage: 19 },
          { name: 'Arts', count: 417, percentage: 18 }
        ]
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendData = useCallback(async (trendType, period = 'weekly') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getTrendData(trendType, period);
      setTrendData(response);
      return response;
    } catch (err) {
      console.error('Error in fetchTrendData:', err);
      setError(err.message);
      // Set mock trend data
      setTrendData({
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [125, 145, 168, 192],
        growth: 15.4,
        insights: ['Steady growth in tech events', 'Weekend events popular']
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCohortAnalysis = useCallback(async (cohortType = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getCohortAnalysis(cohortType);
      setCohortData(response);
      return response;
    } catch (err) {
      console.error('Error in fetchCohortAnalysis:', err);
      setError(err.message);
      // Set mock cohort data
      setCohortData({
        cohorts: [
          { cohort: 'Jan 2024', size: 1250, retention: [100, 68, 54, 42, 38, 32] },
          { cohort: 'Feb 2024', size: 1420, retention: [100, 72, 58, 45, 40, 35] },
          { cohort: 'Mar 2024', size: 1380, retention: [100, 70, 55, 44, 39, 33] }
        ]
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sentiment Analysis Functions
  const fetchSentimentOverview = useCallback(async (timeframe = 'week') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getSentimentOverview(timeframe);
      setSentimentOverview(response);
      return response;
    } catch (err) {
      console.error('Error in fetchSentimentOverview:', err);
      setError(err.message);
      // Set mock sentiment data
      setSentimentOverview({
        positive: 65,
        neutral: 25,
        negative: 10,
        total: 1245,
        keywords: ['great', 'organized', 'fun', 'expensive', 'parking'],
        trend: [
          { date: 'Mon', sentiment: 0.75 },
          { date: 'Tue', sentiment: 0.78 },
          { date: 'Wed', sentiment: 0.82 },
          { date: 'Thu', sentiment: 0.79 },
          { date: 'Fri', sentiment: 0.85 },
          { date: 'Sat', sentiment: 0.88 },
          { date: 'Sun', sentiment: 0.86 }
        ]
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchToxicityAlerts = useCallback(async (threshold = 0.7) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getToxicityAlerts(threshold);
      setToxicityAlerts(response.alerts || []);
      return response;
    } catch (err) {
      console.error('Error in fetchToxicityAlerts:', err);
      setError(err.message);
      setToxicityAlerts([
        { id: 1, content: 'Review with inappropriate language', score: 0.89 },
        { id: 2, content: 'Spam comment detected', score: 0.92 }
      ]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time monitoring for fraud
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await adminAIService.getFraudAlerts('active');
        const alerts = response.alerts || response.data?.alerts || [];
        setFraudAlerts(alerts);
      } catch (err) {
        console.error('Error polling fraud alerts:', err);
        // Keep existing alerts on error
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, []);

  return {
    loading,
    error,
    fraudAlerts,
    platformAnalytics,
    trendData,
    cohortData,
    sentimentOverview,
    toxicityAlerts,
    // Fraud Detection
    fetchFraudAlerts,
    blockBooking,
    resolveAlert,
    // Analytics
    fetchPlatformAnalytics,
    fetchTrendData,
    fetchCohortAnalysis,
    // Sentiment
    fetchSentimentOverview,
    fetchToxicityAlerts
  };
};

export const useFraudDetection = () => {
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [riskScores, setRiskScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeBooking = async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate analysis
      const riskScore = Math.random() * 0.5 + 0.3;
      const anomalies = [];
      
      if (bookingData.amount > 1000) anomalies.push('High value transaction');
      if (bookingData.quantity > 5) anomalies.push('Bulk purchase');
      
      const data = {
        riskScore,
        riskLevel: riskScore > 0.8 ? 'high' : riskScore > 0.5 ? 'medium' : 'low',
        anomalies,
        recommendations: ['Verify identity', 'Check payment method']
      };
      
      if (data.riskScore > 0.8) {
        setSuspiciousActivities(prev => [...prev, {
          bookingId: bookingData.bookingId,
          riskScore: data.riskScore,
          reasons: data.anomalies,
          timestamp: new Date().toISOString()
        }]);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserRiskScore = (userId) => riskScores[userId];

  return {
    suspiciousActivities,
    riskScores,
    loading,
    error,
    analyzeBooking,
    getUserRiskScore
  };
};