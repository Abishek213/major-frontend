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
    const trimmed = token.trim();
    const parts = trimmed.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\s/g, "");

    let decodedStr;
    try {
      decodedStr = atob(base64);
    } catch (e) {
      console.error("atob failed for token part:", base64Url, e);
      return null;
    }

    const jsonPayload = decodeURIComponent(
      decodedStr
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
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);

  const preferencesLoadedRef = useRef(false);
  const insightsLoadedRef = useRef(false);
  const userIdRef = useRef(null);
  const prevUserRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      if (isAuthenticated()) {
        const token = getToken();
        const role = getUserRole();
        const decodedToken = safeDecodeToken(token);
        const userFromToken = decodedToken?.user || {};

        const savedPreferences = localStorage.getItem("userPreferences");
        const preferences = savedPreferences
          ? JSON.parse(savedPreferences)
          : DEFAULT_USER_PREFERENCES;

        const savedInteractions = localStorage.getItem("userInteractions");
        const interactions = savedInteractions
          ? JSON.parse(savedInteractions)
          : [];

        return {
          token,
          role,
          id: userFromToken.id || null,
          email: userFromToken.email || null,
          name: userFromToken.fullname || null,
          isEmailVerified: false,
          isMobileVerified: false,
          emailSubscribed: true,
          contactNo: "",
          preferences,
          interactions,
          lastLogin: new Date().toISOString(),
          loginCount: parseInt(localStorage.getItem("loginCount") || "0"),
        };
      }
    } catch (error) {
      console.error("Error initializing auth state:", error);
      clearAuth();
    }
    return null;
  });

  useEffect(() => {
    if (user?.id !== userIdRef.current) {
      userIdRef.current = user?.id || null;
      preferencesLoadedRef.current = false;
      insightsLoadedRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!prevUserRef.current && user) {
      trackInteraction("login", {
        method: "token",
        loginCount: user.loginCount,
      });
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    setLoading(false);
  }, []);

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
    if (!user?.id || preferencesLoadedRef.current) return;
    preferencesLoadedRef.current = true;
    try {
      setLoadingPreferences(true);
      // 🔇 Commented out missing backend endpoint
      // const response = await api.safeGet(`/users/${user.id}/preferences`);
      // if (response.data) {
      //   const mergedPreferences = {
      //     ...DEFAULT_USER_PREFERENCES,
      //     ...response.data,
      //     aiPersonalization: {
      //       ...DEFAULT_USER_PREFERENCES.aiPersonalization,
      //       ...response.data.aiPersonalization,
      //     },
      //     notifications: {
      //       ...DEFAULT_USER_PREFERENCES.notifications,
      //       ...response.data.notifications,
      //     },
      //     privacy: {
      //       ...DEFAULT_USER_PREFERENCES.privacy,
      //       ...response.data.privacy,
      //     },
      //   };
      //   setUser((prev) => {
      //     if (
      //       JSON.stringify(prev?.preferences) ===
      //       JSON.stringify(mergedPreferences)
      //     ) {
      //       return prev;
      //     }
      //     return { ...prev, preferences: mergedPreferences };
      //   });
      //   localStorage.setItem(
      //     "userPreferences",
      //     JSON.stringify(mergedPreferences)
      //   );
      // }
    } catch (error) {
      if (Number(error?.status) !== 404) {
        console.error("Error loading user preferences:", error);
      }
    } finally {
      setLoadingPreferences(false);
    }
  }, [user?.id]);

  const generateUserInsights = useCallback(async () => {
    if (
      !user?.id ||
      !user?.preferences?.aiPersonalization?.enabled ||
      insightsLoadedRef.current
    )
      return;
    insightsLoadedRef.current = true;
    try {
      // 🔇 Commented out missing backend endpoint
      // const response = await api.safePost("/ai/user-insights", {
      //   userId: user.id,
      //   interactions: user.interactions?.slice(-50),
      //   preferences: user.preferences,
      // });
      // setAiInsights(response.data);
      // setUser((prev) => (prev ? { ...prev, aiInsights: response.data } : prev));
    } catch (error) {
      if (Number(error?.status) !== 404) {
        console.error("Error generating AI insights:", error);
      }
    }
  }, [user?.id, user?.preferences?.aiPersonalization?.enabled]);

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

      setUser((prev) => {
        if (!prev) return prev;
        try {
          localStorage.setItem(
            "userInteractions",
            JSON.stringify(prev.interactions)
          );
          localStorage.setItem(
            "userPreferences",
            JSON.stringify(prev.preferences)
          );
        } catch (e) {
          console.error("Error storing interaction in localStorage", e);
        }
        return prev;
      });

      // 🔇 Commented out missing backend endpoint (fire‑and‑forget)
      // api.safePost("/user-interactions", interaction).catch(() => {});
    },
    [user?.id]
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
          privacy: {
            ...user.preferences?.privacy,
            ...newPreferences.privacy,
          },
        };
        setUser((prev) => ({ ...prev, preferences: updatedPreferences }));
        localStorage.setItem(
          "userPreferences",
          JSON.stringify(updatedPreferences)
        );
        // 🔇 Commented out missing backend endpoint
        // await api.safePut(`/users/${user.id}/preferences`, updatedPreferences);

        if (newPreferences.aiPersonalization?.enabled !== undefined) {
          insightsLoadedRef.current = false;
          generateUserInsights();
        }
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
      setUser((prev) => ({
        ...prev,
        preferences: DEFAULT_USER_PREFERENCES,
        interactions: [],
      }));
      setAiInsights(null);
      preferencesLoadedRef.current = false;
      insightsLoadedRef.current = false;
      return { success: true };
    } catch (error) {
      console.error("Error clearing user data:", error);
      throw error;
    }
  }, [user?.id]);

  // Verification methods
  const sendEmailOtp = async (email) => {
    await api.post("/auth/send-email-otp", { email });
  };

  const verifyEmailOtp = async (email, otp) => {
    await api.post("/auth/verify-email-otp", { email, otp });
    setUser((prev) => ({ ...prev, isEmailVerified: true }));
  };

  const sendMobileOtp = async (mobile) => {
    await api.post("/auth/send-mobile-otp", { mobile });
  };

  const verifyMobileOtp = async (mobile, otp) => {
    await api.post("/auth/verify-mobile-otp", { mobile, otp });
    setUser((prev) => ({ ...prev, isMobileVerified: true }));
  };

  const toggleSubscription = async (subscribed) => {
    await api.put("/auth/subscription", { subscribed });
    setUser((prev) => ({ ...prev, emailSubscribed: subscribed }));
  };

  const login = async (token, role, userData = {}) => {
    try {
      const resolvedRole = role || "User";
      setAuth(token, resolvedRole);

      const decodedToken = safeDecodeToken(token);
      const userFromToken = decodedToken?.user || {};

      const loginCount =
        parseInt(localStorage.getItem("loginCount") || "0") + 1;
      localStorage.setItem("loginCount", loginCount.toString());

      const newUser = {
        token,
        role: resolvedRole,
        id: userFromToken.id || userData?.id || userData?._id || null,
        email: userFromToken.email || userData?.email || null,
        name:
          userFromToken.fullname ||
          userData?.fullname ||
          userData?.name ||
          null,
        contactNo: userData?.contactNo || "",
        isEmailVerified: userData?.isEmailVerified ?? false,
        isMobileVerified: userData?.isMobileVerified ?? false,
        emailSubscribed: userData?.emailSubscribed ?? true,
        preferences: DEFAULT_USER_PREFERENCES,
        interactions: [],
        lastLogin: new Date().toISOString(),
        loginCount,
      };

      const savedPreferences = localStorage.getItem("userPreferences");
      if (savedPreferences) {
        try {
          newUser.preferences = {
            ...DEFAULT_USER_PREFERENCES,
            ...JSON.parse(savedPreferences),
          };
        } catch (e) {
          console.error("Error parsing saved preferences:", e);
        }
      }
      const savedInteractions = localStorage.getItem("userInteractions");
      if (savedInteractions) {
        try {
          newUser.interactions = JSON.parse(savedInteractions);
        } catch (e) {
          console.error("Error parsing saved interactions:", e);
        }
      }

      setUser(newUser);
    } catch (error) {
      console.error("Error during login:", error);
      clearAuth();
      setUser(null);
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    try {
      if (user?.id) {
        trackInteraction("logout", {
          sessionDuration: new Date() - new Date(user.lastLogin),
        });
      }
      clearAuth();
      setUser(null);
      setAiInsights(null);
      preferencesLoadedRef.current = false;
      insightsLoadedRef.current = false;
    } catch (error) {
      console.error("Error during logout:", error);
      setUser(null);
      setAiInsights(null);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
      generateUserInsights();
    }
  }, [user?.id, loadUserPreferences, generateUserInsights]);

  useEffect(() => {
    if (user?.id) {
      trackInteraction("page_view", {
        path: window.location.pathname,
        referrer: document.referrer,
      });
    }
  }, [user?.id, trackInteraction, window.location.pathname]);

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
