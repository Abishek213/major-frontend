// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  getToken,
  setAuth,
  clearAuth,
  getUserRole,
  isAuthenticated,
} from "../utils/auth";
import api from "../utils/api";
import websocketManager from "../utils/websocketManager";

const AuthContext = createContext(null);

const safeDecodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const DEFAULT_USER_PREFERENCES = {
  preferredCategories: [],
  preferredLocations: [],
  priceRange: { min: 0, max: 10000 },
  eventTypes: [],
  preferredDays: [],
  preferredTimes: [],
  notifications: {
    email: true,
    push: true,
    sms: false,
    aiRecommendations: true,
    priceDrops: true,
    eventReminders: true,
    organizerResponses: true,
  },
  aiPersonalization: {
    enabled: true,
    shareInteractionData: true,
    receivePersonalizedRecommendations: true,
    receiveSmartAlerts: true,
    language: "en",
    theme: "light",
  },
  privacy: {
    shareProfileWithOrganizers: false,
    showAttendancePublicly: false,
    allowAnalytics: true,
  },
  interactionSummary: {
    totalViews: 0,
    totalBookings: 0,
    totalWishlistAdds: 0,
    totalSearches: 0,
    favoriteCategories: [],
    averageSpending: 0,
    lastActive: null,
  },
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  
  // Use refs to prevent memory leaks and unnecessary re-renders
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize user from localStorage on mount
  useEffect(() => {
    let isActive = true;
    
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth from localStorage');
        const token = getToken();
        const role = getUserRole();
        
        console.log('🔐 Token exists:', !!token);
        console.log('🔐 Role:', role);
        
        if (token && role && isAuthenticated()) {
          const decodedToken = safeDecodeToken(token);
          console.log('🔐 Decoded token:', decodedToken);
          
          // Extract user data from token
          const userData = decodedToken?.user || decodedToken;
          const userId = userData?.id || userData?.userId || decodedToken?.id;
          
          console.log('🔐 User ID:', userId);
          
          const savedPreferences = localStorage.getItem("userPreferences");
          const preferences = savedPreferences
            ? JSON.parse(savedPreferences)
            : DEFAULT_USER_PREFERENCES;

          const savedInteractions = localStorage.getItem("userInteractions");
          const interactions = savedInteractions
            ? JSON.parse(savedInteractions)
            : [];

          if (isActive && isMounted.current) {
            setUser({
              token,
              role,
              id: userId,
              email: userData?.email || decodedToken?.email || null,
              name: userData?.name || userData?.fullname || decodedToken?.name || null,
              fullname: userData?.fullname || userData?.name || decodedToken?.fullname || null,
              isEmailVerified: false,
              isMobileVerified: false,
              emailSubscribed: true,
              contactNo: "",
              preferences,
              interactions,
              lastLogin: new Date().toISOString(),
              loginCount: parseInt(localStorage.getItem("loginCount") || "0"),
              aiInsights: null,
            });
            
            console.log('🔐 User set successfully');
          }
        } else {
          console.log('🔐 No valid auth found');
          if (isActive && isMounted.current) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
        clearAuth();
        if (isActive && isMounted.current) {
          setUser(null);
        }
      } finally {
        if (isActive && isMounted.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isActive = false;
    };
  }, []);

  // Handle WebSocket connection
  useEffect(() => {
    if (user?.token) {
      websocketManager.connect(user.token);
    } else {
      if (websocketManager.isConnected() || websocketManager.isConnecting) {
        websocketManager.disconnect();
      }
    }
  }, [user?.token]);

  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoadingPreferences(true);
      const response = await api.safeGet(`/users/${user.id}/preferences`);
      if (response.data && isMounted.current) {
        const mergedPreferences = {
          ...DEFAULT_USER_PREFERENCES,
          ...response.data,
          aiPersonalization: {
            ...DEFAULT_USER_PREFERENCES.aiPersonalization,
            ...response.data.aiPersonalization,
          },
          notifications: {
            ...DEFAULT_USER_PREFERENCES.notifications,
            ...response.data.notifications,
          },
          privacy: {
            ...DEFAULT_USER_PREFERENCES.privacy,
            ...response.data.privacy,
          },
        };
        setUser((prev) => prev ? { ...prev, preferences: mergedPreferences } : prev);
        localStorage.setItem(
          "userPreferences",
          JSON.stringify(mergedPreferences)
        );
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    } finally {
      if (isMounted.current) {
        setLoadingPreferences(false);
      }
    }
  }, [user?.id]);

  const generateUserInsights = useCallback(async () => {
    if (!user?.id || !user?.preferences?.aiPersonalization?.enabled) return;
    try {
      const response = await api.safePost("/ai/user-insights", {
        userId: user.id,
        interactions: user.interactions?.slice(-50),
        preferences: user.preferences,
      });
      if (response.data && isMounted.current) {
        setAiInsights(response.data);
        setUser((prev) => prev ? { ...prev, aiInsights: response.data } : prev);
      }
    } catch (error) {
      console.error("Error generating AI insights:", error);
    }
  }, [user?.id, user?.preferences, user?.interactions]);

  const trackInteraction = useCallback(
    async (interactionType, data = {}) => {
      if (!user?.id) return;
      const interaction = {
        type: interactionType,
        timestamp: new Date().toISOString(),
        userId: user.id,
        ...data,
      };
      
      setUser((prev) => {
        if (!prev) return prev;
        const updatedInteractions = [...(prev.interactions || []), interaction];
        if (updatedInteractions.length > 100) updatedInteractions.shift();
        const summary = { ...prev.preferences?.interactionSummary };
        summary.totalViews += interactionType === "view" ? 1 : 0;
        summary.totalBookings += interactionType === "booking" ? 1 : 0;
        summary.totalWishlistAdds += interactionType === "wishlist_add" ? 1 : 0;
        summary.totalSearches += interactionType === "search" ? 1 : 0;
        summary.lastActive = new Date().toISOString();
        if (data.category) {
          const categories = summary.favoriteCategories || [];
          const existing = categories.find((c) => c.name === data.category);
          if (existing) existing.count += 1;
          else categories.push({ name: data.category, count: 1 });
          summary.favoriteCategories = categories
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }
        if (data.amount) {
          const totalSpent =
            summary.averageSpending * summary.totalBookings +
            parseFloat(data.amount);
          summary.averageSpending = totalSpent / (summary.totalBookings || 1);
        }
        return {
          ...prev,
          interactions: updatedInteractions,
          preferences: { ...prev.preferences, interactionSummary: summary },
        };
      });
      
      try {
        const storedInteractions = localStorage.getItem("userInteractions");
        const interactions = storedInteractions
          ? JSON.parse(storedInteractions)
          : [];
        interactions.push(interaction);
        if (interactions.length > 200)
          interactions.splice(0, interactions.length - 200);
        localStorage.setItem("userInteractions", JSON.stringify(interactions));
        if (user.preferences)
          localStorage.setItem(
            "userPreferences",
            JSON.stringify(user.preferences)
          );
      } catch (error) {
        console.error("Error storing interaction:", error);
      }
      
      // Fire and forget - don't await
      api.safePost("/user-interactions", interaction).catch(() => {});
    },
    [user?.id, user?.preferences]
  );

  const updatePreferences = useCallback(
    async (newPreferences) => {
      if (!user?.id) return;
      try {
        const updatedPreferences = {
          ...user.preferences,
          ...newPreferences,
          aiPersonalization: {
            ...user.preferences?.aiPersonalization,
            ...newPreferences.aiPersonalization,
          },
          notifications: {
            ...user.preferences?.notifications,
            ...newPreferences.notifications,
          },
          privacy: { ...user.preferences?.privacy, ...newPreferences.privacy },
        };
        
        setUser((prev) => prev ? { ...prev, preferences: updatedPreferences } : prev);
        localStorage.setItem(
          "userPreferences",
          JSON.stringify(updatedPreferences)
        );
        
        await api.safePut(`/users/${user.id}/preferences`, updatedPreferences);
        
        if (newPreferences.aiPersonalization?.enabled !== undefined)
          generateUserInsights();
        return { success: true };
      } catch (error) {
        console.error("Error updating preferences:", error);
        throw error;
      }
    },
    [user?.id, user?.preferences, generateUserInsights]
  );

  const addPreferredCategory = useCallback(
    async (categoryId, categoryName) => {
      if (!user?.id) return;
      const currentCategories = user.preferences?.preferredCategories || [];
      if (!currentCategories.includes(categoryId)) {
        await updatePreferences({
          preferredCategories: [...currentCategories, categoryId],
        });
        await trackInteraction("preference_add", {
          type: "category",
          categoryId,
          categoryName,
        });
      }
    },
    [user?.id, user?.preferences, updatePreferences, trackInteraction]
  );

  const removePreferredCategory = useCallback(
    async (categoryId) => {
      if (!user?.id) return;
      const currentCategories = user.preferences?.preferredCategories || [];
      await updatePreferences({
        preferredCategories: currentCategories.filter(
          (id) => id !== categoryId
        ),
      });
    },
    [user?.id, user?.preferences, updatePreferences]
  );

  const addPreferredLocation = useCallback(
    async (location) => {
      if (!user?.id) return;
      const currentLocations = user.preferences?.preferredLocations || [];
      if (!currentLocations.includes(location)) {
        await updatePreferences({
          preferredLocations: [...currentLocations, location],
        });
      }
    },
    [user?.id, user?.preferences, updatePreferences]
  );

  const clearUserData = useCallback(async () => {
    if (!user?.id) return;
    try {
      await api.safeDelete(`/users/${user.id}/data`);
      localStorage.removeItem("userPreferences");
      localStorage.removeItem("userInteractions");
      localStorage.removeItem("loginCount");
      setUser((prev) => prev ? ({
        ...prev,
        preferences: DEFAULT_USER_PREFERENCES,
        interactions: [],
        aiInsights: null,
      }) : prev);
      return { success: true };
    } catch (error) {
      console.error("Error clearing user data:", error);
      throw error;
    }
  }, [user?.id]);

  const sendEmailOtp = async (email) => {
    await api.post("/auth/send-email-otp", { email });
  };

  const verifyEmailOtp = async (email, otp) => {
    await api.post("/auth/verify-email-otp", { email, otp });
    setUser((prev) => prev ? { ...prev, isEmailVerified: true } : prev);
  };

  const sendMobileOtp = async (mobile) => {
    await api.post("/auth/send-mobile-otp", { mobile });
  };

  const verifyMobileOtp = async (mobile, otp) => {
    await api.post("/auth/verify-mobile-otp", { mobile, otp });
    setUser((prev) => prev ? { ...prev, isMobileVerified: true } : prev);
  };

  const toggleSubscription = async (subscribed) => {
    await api.put("/auth/subscription", { subscribed });
    setUser((prev) => prev ? { ...prev, emailSubscribed: subscribed } : prev);
  };

  const login = async (token, role, userData = {}) => {
    try {
      const resolvedRole = role || "User";
      setAuth(token, resolvedRole);

      const decodedToken = safeDecodeToken(token);
      const loginCount =
        parseInt(localStorage.getItem("loginCount") || "0") + 1;
      localStorage.setItem("loginCount", loginCount.toString());

      const userDataFromToken = decodedToken?.user || decodedToken;
      const userId = userDataFromToken?.id || userDataFromToken?.userId || decodedToken?.id;

      const newUser = {
        token,
        role: resolvedRole,
        id: userId,
        email: userDataFromToken?.email || userData?.email || null,
        name: userDataFromToken?.name || userDataFromToken?.fullname || userData?.name || null,
        fullname: userDataFromToken?.fullname || userDataFromToken?.name || userData?.fullname || null,
        contactNo: userData?.contactNo || "",
        isEmailVerified: userData?.isEmailVerified ?? false,
        isMobileVerified: userData?.isMobileVerified ?? false,
        emailSubscribed: userData?.emailSubscribed ?? true,
        preferences: DEFAULT_USER_PREFERENCES,
        interactions: [],
        lastLogin: new Date().toISOString(),
        loginCount,
        aiInsights: null,
      };

      setUser(newUser);

      const savedPreferences = localStorage.getItem("userPreferences");
      if (savedPreferences) {
        try {
          const prefs = JSON.parse(savedPreferences);
          newUser.preferences = { ...DEFAULT_USER_PREFERENCES, ...prefs };
          setUser(newUser);
        } catch (e) {
          console.error("Error parsing saved preferences:", e);
        }
      }

      // Don't await these - let them run in background
      trackInteraction("login", { method: "token", loginCount });
      loadUserPreferences();
      generateUserInsights();
      
      return newUser;
    } catch (error) {
      console.error("Error during login:", error);
      clearAuth();
      setUser(null);
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    try {
      // Track logout if user exists
      if (user?.id) {
        trackInteraction("logout", {
          sessionDuration: new Date() - new Date(user.lastLogin),
        });
      }
      
      // Clear auth from localStorage
      clearAuth();
      
      // Disconnect WebSocket
      if (websocketManager.isConnected() || websocketManager.isConnecting) {
        websocketManager.disconnect();
      }
      
      // Clear all user state - IMMEDIATELY
      setUser(null);
      setAiInsights(null);
      
      console.log('🔐 Logout complete');
    } catch (error) {
      console.error("Error during logout:", error);
      // Force clear state even if error
      setUser(null);
      setAiInsights(null);
    }
  };

  // Load preferences when user changes
  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
      generateUserInsights();
      trackInteraction("page_view", {
        path: window.location.pathname,
        referrer: document.referrer,
      });
    }
  }, [user?.id]); // Only depend on user.id, not the functions

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    getToken: () => user?.token || getToken(),
    aiInsights,
    loadingPreferences,
    trackInteraction,
    updatePreferences,
    addPreferredCategory,
    removePreferredCategory,
    addPreferredLocation,
    clearUserData,
    getUserPreferences: () => user?.preferences || DEFAULT_USER_PREFERENCES,
    isAIPersonalizationEnabled: () =>
      user?.preferences?.aiPersonalization?.enabled ?? true,
    getInteractionSummary: () =>
      user?.preferences?.interactionSummary ||
      DEFAULT_USER_PREFERENCES.interactionSummary,
    shouldSendNotification: (type) =>
      user?.preferences?.notifications?.[type] ?? true,
    sendEmailOtp,
    verifyEmailOtp,
    sendMobileOtp,
    verifyMobileOtp,
    toggleSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;