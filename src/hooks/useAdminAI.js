// src/hooks/useAdminAI.js
import { useState, useEffect, useCallback, useRef } from 'react';
import adminAIService from '../services/adminAIService';

export const useAdminAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [sentimentOverview, setSentimentOverview] = useState(null);
  const [toxicityAlerts, setToxicityAlerts] = useState([]);
  
  // Use ref to prevent duplicate error logs
  const errorLogged = useRef(new Set());

  // Helper to handle response and check for mock data
  const handleResponse = (response, setter, defaultValue = null) => {
    if (response) {
      // Check if this is mock data
      if (response._mock) {
        setUsingMockData(true);
        // Only log once per endpoint
        if (!errorLogged.current.has('mock-data')) {
          console.info('📊 Using demo data for AI features (endpoints not available)');
          errorLogged.current.add('mock-data');
        }
      }
      
      // Remove internal flags before setting state
      const { _mock, _warning, _error, ...cleanData } = response;
      setter(cleanData);
      return cleanData;
    }
    
    if (defaultValue) {
      setter(defaultValue);
    }
    return defaultValue;
  };

  // Fraud Detection Functions
  const fetchFraudAlerts = useCallback(async (status = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getFraudAlerts(status);
      
      // Handle both array and object responses
      if (Array.isArray(response)) {
        setFraudAlerts(response);
        return response;
      } else if (response?.alerts) {
        setFraudAlerts(response.alerts);
        return response.alerts;
      }
      
      setFraudAlerts([]);
      return [];
    } catch (err) {
      // Error already handled in service, just update UI state
      setError('Unable to fetch fraud alerts');
      setFraudAlerts([]);
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
      setError('Unable to block booking');
      return { success: false, error: 'Service unavailable' };
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId, action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.resolveFraudAlert(alertId, action);
      
      // Update local state optimistically
      setFraudAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved', resolution: action }
            : alert
        )
      );
      
      return response;
    } catch (err) {
      setError('Unable to resolve alert');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analytics Functions
  const fetchPlatformAnalytics = useCallback(async (timeframe = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getPlatformAnalytics(timeframe);
      return handleResponse(response, setPlatformAnalytics);
    } catch (err) {
      setError('Unable to fetch platform analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendData = useCallback(async (trendType = 'all', period = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getTrendData(trendType, period);
      return handleResponse(response, setTrendData);
    } catch (err) {
      setError('Unable to fetch trend data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCohortAnalysis = useCallback(async (cohortType = 'user', timeframe = '6months') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getCohortAnalysis(cohortType, timeframe);
      return handleResponse(response, setCohortData);
    } catch (err) {
      setError('Unable to fetch cohort analysis');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sentiment Analysis Functions
  const fetchSentimentOverview = useCallback(async (timeframe = '7d') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.getSentimentOverview(timeframe);
      return handleResponse(response, setSentimentOverview);
    } catch (err) {
      setError('Unable to fetch sentiment overview');
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
      
      if (response?.alerts) {
        setToxicityAlerts(response.alerts);
        return response.alerts;
      }
      
      setToxicityAlerts([]);
      return [];
    } catch (err) {
      setError('Unable to fetch toxicity alerts');
      setToxicityAlerts([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      
      // Load all data in parallel
      await Promise.allSettled([
        fetchFraudAlerts('active'),
        fetchPlatformAnalytics(),
        fetchTrendData(),
        fetchCohortAnalysis(),
        fetchSentimentOverview(),
        fetchToxicityAlerts()
      ]);
      
      setLoading(false);
    };

    loadInitialData();
    
    // Cleanup function
    return () => {
      errorLogged.current.clear();
    };
  }, []); // Empty dependency array means this runs once on mount

  // Real-time monitoring for fraud (only if not using mock data)
  useEffect(() => {
    if (usingMockData) {
      // Don't poll if we're using mock data
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await adminAIService.getFraudAlerts('active');
        if (response?.alerts) {
          setFraudAlerts(response.alerts);
        }
      } catch (err) {
        // Silent fail for polling - don't update error state
        console.debug('Polling fraud alerts failed (expected if endpoints not ready)');
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [usingMockData]);

  return {
    loading,
    error,
    usingMockData,
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
  const [usingMockData, setUsingMockData] = useState(false);

  const analyzeBooking = async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAIService.analyzeFraud(bookingData);
      
      // Check if using mock data
      if (response._mock) {
        setUsingMockData(true);
      }
      
      const { _mock, _warning, _error, ...cleanData } = response;
      
      if (cleanData.riskScore > 0.8) {
        setSuspiciousActivities(prev => [...prev, {
          bookingId: bookingData.bookingId,
          riskScore: cleanData.riskScore,
          reasons: cleanData.anomalies || [],
          timestamp: new Date().toISOString()
        }]);
      }
      
      return cleanData;
    } catch (err) {
      setError(err.message);
      return {
        riskScore: 0.5,
        riskLevel: 'medium',
        anomalies: ['Analysis temporarily unavailable'],
        recommendations: ['Manual review recommended']
      };
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
    usingMockData,
    analyzeBooking,
    getUserRiskScore
  };
};