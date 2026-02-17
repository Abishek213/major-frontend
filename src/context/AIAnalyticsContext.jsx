import React, { createContext, useContext, useReducer, useCallback } from 'react';
import adminAIService from '../services/adminAIService';

const AIAnalyticsContext = createContext();

const initialState = {
  platformMetrics: null,
  trendData: {},
  cohortData: null,
  sentimentData: null,
  loading: false,
  error: null,
  lastUpdated: null
};

const aiAnalyticsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PLATFORM_METRICS':
      return { 
        ...state, 
        platformMetrics: action.payload, 
        lastUpdated: new Date().toISOString(),
        loading: false 
      };
    case 'SET_TREND_DATA':
      return { 
        ...state, 
        trendData: { ...state.trendData, [action.payload.trendType]: action.payload.data },
        lastUpdated: new Date().toISOString(),
        loading: false 
      };
    case 'SET_COHORT_DATA':
      return { 
        ...state, 
        cohortData: action.payload,
        lastUpdated: new Date().toISOString(),
        loading: false 
      };
    case 'SET_SENTIMENT_DATA':
      return { 
        ...state, 
        sentimentData: action.payload,
        lastUpdated: new Date().toISOString(),
        loading: false 
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AIAnalyticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aiAnalyticsReducer, initialState);

  const fetchPlatformMetrics = useCallback(async (timeframe = 'month') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await adminAIService.getPlatformAnalytics(timeframe);
      dispatch({ type: 'SET_PLATFORM_METRICS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const fetchTrendData = useCallback(async (trendType, period = 'weekly') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await adminAIService.getTrendData(trendType, period);
      dispatch({ 
        type: 'SET_TREND_DATA', 
        payload: { trendType, data } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const fetchCohortData = useCallback(async (cohortType = 'user') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await adminAIService.getCohortAnalysis(cohortType);
      dispatch({ type: 'SET_COHORT_DATA', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const fetchSentimentOverview = useCallback(async (timeframe = 'week') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await adminAIService.getSentimentOverview(timeframe);
      dispatch({ type: 'SET_SENTIMENT_DATA', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AIAnalyticsContext.Provider
      value={{
        ...state,
        fetchPlatformMetrics,
        fetchTrendData,
        fetchCohortData,
        fetchSentimentOverview,
        clearError
      }}
    >
      {children}
    </AIAnalyticsContext.Provider>
  );
};

export const useAIAnalytics = () => {
  const context = useContext(AIAnalyticsContext);
  if (!context) {
    throw new Error('useAIAnalytics must be used within an AIAnalyticsProvider');
  }
  return context;
};