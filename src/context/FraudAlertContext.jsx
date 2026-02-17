import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import adminAIService from '../services/adminAIService';

const FraudAlertContext = createContext();

const initialState = {
  alerts: [],
  unreadCount: 0,
  selectedAlert: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    riskLevel: 'all',
    dateRange: null
  }
};

const fraudAlertReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ALERTS':
      const unread = action.payload.filter(alert => !alert.read).length;
      return { 
        ...state, 
        alerts: action.payload,
        unreadCount: unread,
        loading: false 
      };
    case 'ADD_ALERT':
      return { 
        ...state, 
        alerts: [action.payload, ...state.alerts],
        unreadCount: state.unreadCount + 1
      };
    case 'UPDATE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload.id ? action.payload : alert
        ),
        unreadCount: state.alerts.filter(a => !a.read).length
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload ? { ...alert, read: true } : alert
        ),
        unreadCount: state.unreadCount - 1
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert => ({ ...alert, read: true })),
        unreadCount: 0
      };
    case 'SELECT_ALERT':
      return { ...state, selectedAlert: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const FraudAlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(fraudAlertReducer, initialState);

  const fetchAlerts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await adminAIService.getFraudAlerts(state.filters.status);
      dispatch({ type: 'SET_ALERTS', payload: data.alerts || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [state.filters.status]);

  const addAlert = useCallback((alert) => {
    dispatch({ type: 'ADD_ALERT', payload: alert });
    
    // Show browser notification if supported
    if (Notification.permission === 'granted') {
      new Notification('🚨 Fraud Alert', {
        body: `${alert.type} detected - Risk Score: ${alert.riskScore}`,
        icon: '/favicon.ico'
      });
    }
  }, []);

  const markAsRead = useCallback((alertId) => {
    dispatch({ type: 'MARK_AS_READ', payload: alertId });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
  }, []);

  const selectAlert = useCallback((alert) => {
    dispatch({ type: 'SELECT_ALERT', payload: alert });
    if (alert && !alert.read) {
      markAsRead(alert.id);
    }
  }, [markAsRead]);

  const updateFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const blockAlertBooking = useCallback(async (alertId, bookingId, reason) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await adminAIService.blockSuspiciousBooking(bookingId, reason);
      
      // Update alert status
      const updatedAlert = state.alerts.find(a => a.id === alertId);
      if (updatedAlert) {
        const resolvedAlert = {
          ...updatedAlert,
          status: 'blocked',
          resolution: reason,
          resolvedAt: new Date().toISOString()
        };
        dispatch({ type: 'UPDATE_ALERT', payload: resolvedAlert });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.alerts]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Poll for new alerts
  useEffect(() => {
    fetchAlerts();
    
    const interval = setInterval(() => {
      fetchAlerts();
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return (
    <FraudAlertContext.Provider
      value={{
        ...state,
        fetchAlerts,
        addAlert,
        markAsRead,
        markAllAsRead,
        selectAlert,
        updateFilters,
        blockAlertBooking
      }}
    >
      {children}
    </FraudAlertContext.Provider>
  );
};

export const useFraudAlerts = () => {
  const context = useContext(FraudAlertContext);
  if (!context) {
    throw new Error('useFraudAlerts must be used within a FraudAlertProvider');
  }
  return context;
};