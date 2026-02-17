import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const isMounted = useRef(true);

  // Initialize audio for notifications
  useEffect(() => {
    // Only create audio in browser environment
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/src/assets/sounds/notification.mp3');
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
        // Preload audio
        audioRef.current.load();
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (isAuthenticated && user?.id && isMounted.current) {
      fetchNotifications(true);
      fetchUnreadCount();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated, user?.id]); // Remove filter from dependencies to prevent excessive calls

  // Separate effect for filter changes
  useEffect(() => {
    if (isAuthenticated && user?.id && isMounted.current) {
      fetchNotifications(true);
    }
  }, [filter]); // Only re-run when filter changes

  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    // Only setup WebSocket if user is authenticated and we haven't initialized yet
    if (!isAuthenticated || !user?.id || wsInitialized.current || !isMounted.current) {
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
          
          // Only update if component is mounted
          if (!isMounted.current) return;
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }

          // Add to notifications list (at the beginning)
          setNotifications(prev => [data.notification, ...prev]);
          
          // Update unread count
          setUnreadCount(prev => prev + 1);
        };

        // Handle unread count updates
        const handleUnreadCount = (data) => {
          console.log('Unread count update:', data);
          if (isMounted.current) {
            setUnreadCount(data.count);
          }
        };

        // Register handlers
        websocketManager.on('new_notification', handleNewNotification);
        websocketManager.on('unread_count', handleUnreadCount);
        
        // Subscribe to notification channels with a slight delay
        const subscriptionTimeout = setTimeout(() => {
          if (websocketManager.isConnected() && isMounted.current) {
            websocketManager.subscribeToNotifications();
            websocketManager.subscribeToUnreadCount();
            wsInitialized.current = true;
          }
        }, 500);

        return () => {
          clearTimeout(subscriptionTimeout);
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
      wsInitialized.current = false;
    };
  }, [isAuthenticated, user?.id, getToken]); // Keep dependencies minimal

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebSocket connection...');
      isMounted.current = false;
      websocketManager.disconnect();
      wsInitialized.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async (reset = false) => {
    // Don't fetch if component is unmounted
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await api.safeGet(`/notifications?page=${currentPage}&limit=10&filter=${filter}`);
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      if (response.data) {
        setNotifications(prev => {
          if (reset) {
            return response.data.notifications || [];
          }
          // Avoid duplicates
          const newNotifications = (response.data.notifications || []).filter(
            newNotif => !prev.some(existing => existing._id === newNotif._id)
          );
          return [...prev, ...newNotifications];
        });
        setHasMore(response.data.hasMore || false);
        setPage(prev => reset ? 2 : prev + 1);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || 'Failed to fetch notifications');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [page, filter]); // Add page and filter as dependencies

  const fetchUnreadCount = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      const response = await api.safeGet('/notifications/count');
      if (isMounted.current && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    if (!isMounted.current) return;
    
    try {
      await api.safePatch(`/notifications/${notificationId}/read`);
      
      if (!isMounted.current) return;
      
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      await api.safePatch('/notifications/read-all');
      
      if (!isMounted.current) return;
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!isMounted.current) return;
    
    try {
      await api.safeDelete(`/notifications/${notificationId}`);
      
      if (!isMounted.current) return;
      
      setNotifications(prev => {
        const deleted = prev.find(n => n._id === notificationId);
        if (deleted && !deleted.read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
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
  }), [
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    filter,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  ]);

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