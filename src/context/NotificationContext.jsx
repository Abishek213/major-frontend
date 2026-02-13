import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import websocketManager from '../utils/websocketManager';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, getToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  
  const wsInitialized = useRef(false);
  const audioRef = useRef(null);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('/src/assets/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, user?.id, filter]);

  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    // Only setup WebSocket if user is authenticated and we haven't initialized yet
    if (!isAuthenticated || !user?.id || wsInitialized.current) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    const setupWebSocket = () => {
      try {
        console.log('Setting up WebSocket connection...');
        websocketManager.connect(token);

        // Handle new notifications
        const handleNewNotification = (data) => {
          console.log('New notification received:', data);
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }

          // Add to notifications list
          setNotifications(prev => [data.notification, ...prev]);
          
          // Update unread count
          setUnreadCount(prev => prev + 1);
        };

        // Handle unread count updates
        const handleUnreadCount = (data) => {
          console.log('Unread count update:', data);
          setUnreadCount(data.count);
        };

        // Register handlers
        websocketManager.on('new_notification', handleNewNotification);
        websocketManager.on('unread_count', handleUnreadCount);
        
        // Subscribe to notification channels
        setTimeout(() => {
          if (websocketManager.isConnected()) {
            websocketManager.subscribeToNotifications();
            websocketManager.subscribeToUnreadCount();
          }
        }, 500);

        wsInitialized.current = true;

        return () => {
          websocketManager.off('new_notification', handleNewNotification);
          websocketManager.off('unread_count', handleUnreadCount);
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    };

    const cleanup = setupWebSocket();

    return () => {
      if (cleanup) cleanup();
      
      // Don't disconnect here - let the provider handle cleanup on unmount
      wsInitialized.current = false;
    };
  }, [isAuthenticated, user?.id, getToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebSocket connection...');
      websocketManager.disconnect();
      wsInitialized.current = false;
    };
  }, []);

  const fetchNotifications = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await api.safeGet(`/notifications?page=${currentPage}&limit=10&filter=${filter}`);
      
      if (response.data) {
        setNotifications(prev => reset ? response.data.notifications : [...prev, ...response.data.notifications]);
        setHasMore(response.data.hasMore);
        setPage(prev => reset ? 2 : prev + 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.safeGet('/notifications/count');
      if (response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.safePatch(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.safePatch('/notifications/read-all');
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.safeDelete(`/notifications/${notificationId}`);
      
      setNotifications(prev => {
        const deleted = prev.find(n => n._id === notificationId);
        if (deleted && !deleted.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const refreshNotifications = () => {
    fetchNotifications(true);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    filter,
    setFilter,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;