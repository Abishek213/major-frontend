import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setAuth, clearAuth, getUserRole, isAuthenticated } from '../utils/auth';
import api from '../utils/api';

const AuthContext = createContext(null);

const safeDecodeToken = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Default user preferences for AI personalization
const DEFAULT_USER_PREFERENCES = {
  // Event preferences
  preferredCategories: [],
  preferredLocations: [],
  priceRange: { min: 0, max: 10000 },
  eventTypes: [],
  preferredDays: [],
  preferredTimes: [],
  
  // Notification preferences
  notifications: {
    email: true,
    push: true,
    sms: false,
    aiRecommendations: true,
    priceDrops: true,
    eventReminders: true,
    organizerResponses: true
  },
  
  // AI personalization settings
  aiPersonalization: {
    enabled: true,
    shareInteractionData: true,
    receivePersonalizedRecommendations: true,
    receiveSmartAlerts: true,
    language: 'en',
    theme: 'light'
  },
  
  // Privacy settings
  privacy: {
    shareProfileWithOrganizers: false,
    showAttendancePublicly: false,
    allowAnalytics: true
  },
  
  // Interaction history summary
  interactionSummary: {
    totalViews: 0,
    totalBookings: 0,
    totalWishlistAdds: 0,
    totalSearches: 0,
    favoriteCategories: [],
    averageSpending: 0,
    lastActive: null
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      if (isAuthenticated()) {
        const token = getToken();
        const role = getUserRole();
        const decodedToken = safeDecodeToken(token);
        
        // Load saved preferences from localStorage
        const savedPreferences = localStorage.getItem('userPreferences');
        const preferences = savedPreferences ? JSON.parse(savedPreferences) : DEFAULT_USER_PREFERENCES;
        
        // Load interaction history
        const savedInteractions = localStorage.getItem('userInteractions');
        const interactions = savedInteractions ? JSON.parse(savedInteractions) : [];
        
        return {
          token,
          role,
          id: decodedToken?.id || null,
          email: decodedToken?.email || null,
          name: decodedToken?.name || decodedToken?.fullname || null,
          preferences,
          interactions,
          lastLogin: new Date().toISOString(),
          loginCount: parseInt(localStorage.getItem('loginCount') || '0'),
          aiInsights: null
        };
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      clearAuth();
    }
    return null;
  });

  const [aiInsights, setAiInsights] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);

  // Load user preferences from backend
  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingPreferences(true);
      const response = await api.safeGet(`/users/${user.id}/preferences`);
      
      if (response.data) {
        const mergedPreferences = {
          ...DEFAULT_USER_PREFERENCES,
          ...response.data,
          aiPersonalization: {
            ...DEFAULT_USER_PREFERENCES.aiPersonalization,
            ...response.data.aiPersonalization
          },
          notifications: {
            ...DEFAULT_USER_PREFERENCES.notifications,
            ...response.data.notifications
          },
          privacy: {
            ...DEFAULT_USER_PREFERENCES.privacy,
            ...response.data.privacy
          }
        };
        
        setUser(prev => ({
          ...prev,
          preferences: mergedPreferences
        }));
        
        // Save to localStorage as cache
        localStorage.setItem('userPreferences', JSON.stringify(mergedPreferences));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setLoadingPreferences(false);
    }
  }, [user?.id]);

  // Generate AI insights about user behavior
  const generateUserInsights = useCallback(async () => {
    if (!user?.id || !user?.preferences?.aiPersonalization?.enabled) return;
    
    try {
      const response = await api.safePost('/ai/user-insights', {
        userId: user.id,
        interactions: user.interactions?.slice(-50), // Last 50 interactions
        preferences: user.preferences
      });
      
      setAiInsights(response.data);
      
      setUser(prev => ({
        ...prev,
        aiInsights: response.data
      }));
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  }, [user?.id, user?.preferences, user?.interactions]);

  // Track user interaction for AI learning
  const trackInteraction = useCallback(async (interactionType, data = {}) => {
    if (!user?.id) return;
    
    const interaction = {
      type: interactionType,
      timestamp: new Date().toISOString(),
      userId: user.id,
      ...data
    };
    
    // Update local state
    setUser(prev => {
      const updatedInteractions = [...(prev.interactions || []), interaction];
      // Keep only last 100 interactions in memory
      if (updatedInteractions.length > 100) {
        updatedInteractions.shift();
      }
      
      // Update interaction summary
      const summary = { ...prev.preferences?.interactionSummary };
      summary.totalViews += interactionType === 'view' ? 1 : 0;
      summary.totalBookings += interactionType === 'booking' ? 1 : 0;
      summary.totalWishlistAdds += interactionType === 'wishlist_add' ? 1 : 0;
      summary.totalSearches += interactionType === 'search' ? 1 : 0;
      summary.lastActive = new Date().toISOString();
      
      // Update favorite categories
      if (data.category) {
        const categories = summary.favoriteCategories || [];
        const existing = categories.find(c => c.name === data.category);
        if (existing) {
          existing.count += 1;
        } else {
          categories.push({ name: data.category, count: 1 });
        }
        summary.favoriteCategories = categories.sort((a, b) => b.count - a.count).slice(0, 5);
      }
      
      // Update average spending
      if (data.amount) {
        const totalSpent = (summary.averageSpending * summary.totalBookings) + parseFloat(data.amount);
        summary.averageSpending = totalSpent / (summary.totalBookings || 1);
      }
      
      return {
        ...prev,
        interactions: updatedInteractions,
        preferences: {
          ...prev.preferences,
          interactionSummary: summary
        }
      };
    });
    
    // Store in localStorage
    try {
      const storedInteractions = localStorage.getItem('userInteractions');
      const interactions = storedInteractions ? JSON.parse(storedInteractions) : [];
      interactions.push(interaction);
      // Keep only last 200 interactions in localStorage
      if (interactions.length > 200) {
        interactions.splice(0, interactions.length - 200);
      }
      localStorage.setItem('userInteractions', JSON.stringify(interactions));
      
      // Update preferences in localStorage
      if (user.preferences) {
        localStorage.setItem('userPreferences', JSON.stringify(user.preferences));
      }
    } catch (error) {
      console.error('Error storing interaction:', error);
    }
    
    // Send to backend for AI training (fire and forget)
    try {
      await api.safePost('/user-interactions', interaction).catch(() => {});
    } catch (error) {
      // Silently fail - non-critical
    }
  }, [user?.id, user?.preferences]);

  // Update user preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    if (!user?.id) return;
    
    try {
      const updatedPreferences = {
        ...user.preferences,
        ...newPreferences,
        aiPersonalization: {
          ...user.preferences?.aiPersonalization,
          ...newPreferences.aiPersonalization
        },
        notifications: {
          ...user.preferences?.notifications,
          ...newPreferences.notifications
        },
        privacy: {
          ...user.preferences?.privacy,
          ...newPreferences.privacy
        }
      };
      
      setUser(prev => ({
        ...prev,
        preferences: updatedPreferences
      }));
      
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      
      // Send to backend
      await api.safePut(`/users/${user.id}/preferences`, updatedPreferences);
      
      // Regenerate AI insights if personalization settings changed
      if (newPreferences.aiPersonalization?.enabled !== undefined) {
        generateUserInsights();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }, [user?.id, user?.preferences, generateUserInsights]);

  // Add preference for a category
  const addPreferredCategory = useCallback(async (categoryId, categoryName) => {
    if (!user?.id) return;
    
    const currentCategories = user.preferences?.preferredCategories || [];
    if (!currentCategories.includes(categoryId)) {
      await updatePreferences({
        preferredCategories: [...currentCategories, categoryId]
      });
      
      // Track interaction for AI learning
      await trackInteraction('preference_add', { 
        type: 'category',
        categoryId,
        categoryName 
      });
    }
  }, [user?.id, user?.preferences, updatePreferences, trackInteraction]);

  // Remove preference for a category
  const removePreferredCategory = useCallback(async (categoryId) => {
    if (!user?.id) return;
    
    const currentCategories = user.preferences?.preferredCategories || [];
    await updatePreferences({
      preferredCategories: currentCategories.filter(id => id !== categoryId)
    });
  }, [user?.id, user?.preferences, updatePreferences]);

  // Add preferred location
  const addPreferredLocation = useCallback(async (location) => {
    if (!user?.id) return;
    
    const currentLocations = user.preferences?.preferredLocations || [];
    if (!currentLocations.includes(location)) {
      await updatePreferences({
        preferredLocations: [...currentLocations, location]
      });
    }
  }, [user?.id, user?.preferences, updatePreferences]);

  // Clear all user data (for privacy/GDPR)
  const clearUserData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Clear from backend
      await api.safeDelete(`/users/${user.id}/data`);
      
      // Clear from localStorage
      localStorage.removeItem('userPreferences');
      localStorage.removeItem('userInteractions');
      localStorage.removeItem('loginCount');
      
      // Reset state
      setUser(prev => ({
        ...prev,
        preferences: DEFAULT_USER_PREFERENCES,
        interactions: [],
        aiInsights: null
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }, [user?.id]);

  const login = async (token, role, userData = {}) => {
    try {
      setAuth(token, role);
      const decodedToken = safeDecodeToken(token);
      
      // Increment login count
      const loginCount = parseInt(localStorage.getItem('loginCount') || '0') + 1;
      localStorage.setItem('loginCount', loginCount.toString());
      
      const newUser = {
        token,
        role,
        id: decodedToken?.id || userData?.id || null,
        email: decodedToken?.email || userData?.email || null,
        name: decodedToken?.name || decodedToken?.fullname || userData?.name || null,
        preferences: DEFAULT_USER_PREFERENCES,
        interactions: [],
        lastLogin: new Date().toISOString(),
        loginCount,
        aiInsights: null
      };
      
      setUser(newUser);
      
      // Load saved preferences from localStorage
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        try {
          const prefs = JSON.parse(savedPreferences);
          newUser.preferences = { ...DEFAULT_USER_PREFERENCES, ...prefs };
          setUser(newUser);
        } catch (e) {
          console.error('Error parsing saved preferences:', e);
        }
      }
      
      // Track login interaction
      await trackInteraction('login', { 
        method: 'token',
        loginCount 
      });
      
      // Load preferences from backend (will override localStorage)
      await loadUserPreferences();
      
      // Generate AI insights
      await generateUserInsights();
      
    } catch (error) {
      console.error('Error during login:', error);
      clearAuth();
      setUser(null);
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    try {
      // Track logout before clearing
      if (user?.id) {
        trackInteraction('logout', { 
          sessionDuration: new Date() - new Date(user.lastLogin) 
        });
      }
      
      clearAuth();
      
      // Don't clear preferences on logout - keep them for next login
      // Only clear sensitive session data
      
      setUser(null);
      setAiInsights(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear user state even if clearing localStorage fails
      setUser(null);
      setAiInsights(null);
    }
  };

  // Load preferences on mount if user exists
  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
      generateUserInsights();
      
      // Track page view for AI learning
      trackInteraction('page_view', { 
        path: window.location.pathname,
        referrer: document.referrer 
      });
    }
  }, [user?.id, loadUserPreferences, generateUserInsights, trackInteraction]);

  const value = {
  user,
  login,
  logout,
  isAuthenticated: !!user,
  getToken: () => user?.token || getToken(),
    
    // AI & Personalization
    aiInsights,
    loadingPreferences,
    trackInteraction,
    updatePreferences,
    addPreferredCategory,
    removePreferredCategory,
    addPreferredLocation,
    clearUserData,
    
    // Helper methods
    getUserPreferences: () => user?.preferences || DEFAULT_USER_PREFERENCES,
    isAIPersonalizationEnabled: () => user?.preferences?.aiPersonalization?.enabled ?? true,
    getInteractionSummary: () => user?.preferences?.interactionSummary || DEFAULT_USER_PREFERENCES.interactionSummary,
    
    // Notification preferences
    shouldSendNotification: (type) => {
      return user?.preferences?.notifications?.[type] ?? true;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;