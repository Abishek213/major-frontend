import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import api from "../utils/api";
import websocketManager from "../utils/websocketManager";
import { useAuth } from "./AuthContext";

let notificationSoundUrl = null;
try {
  const resolved = new URL("../assets/sounds/notification.mp3", import.meta.url)
    .href;
  if (resolved?.endsWith(".mp3")) notificationSoundUrl = resolved;
} catch {
  notificationSoundUrl = null;
}

const playBeep = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext blocked (e.g. no user gesture yet) — fail silently
  }
};

const NotificationToast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  if (!toast) return null;

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[9999] max-w-sm animate-slide-up"
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl flex items-start gap-3 p-4">
        {/* Red pulsing dot */}
        <span className="mt-1 flex h-3 w-3 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">
            New Notification
          </p>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
};
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeToast, setActiveToast] = useState(null);
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    toastEnabled: true,
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const preferencesRef = useRef(preferences);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const audioRef = useRef(null);
  const isMounted = useRef(true);
  const pageRef = useRef(1);

  const token = user?.token ?? null;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && notificationSoundUrl) {
      audioRef.current = new Audio(notificationSoundUrl);
      audioRef.current.volume = 0.5;
      audioRef.current.load();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = useCallback(() => {
    if (!preferences.soundEnabled) return;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => playBeep());
    } else {
      playBeep();
    }
  }, [preferences.soundEnabled]);

  // Fetch preferences from backend
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setPreferencesLoading(true);
    try {
      const response = await api.safeGet("/users/notification-preferences");
      if (response.data?.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (err) {
      console.error("Failed to fetch notification preferences:", err);
    } finally {
      setPreferencesLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Update preferences
  const updatePreferences = useCallback(
    async (newPrefs) => {
      if (!isAuthenticated) return;
      // Optimistic update
      setPreferences((prev) => ({ ...prev, ...newPrefs }));
      try {
        const response = await api.safePut(
          "/users/notification-preferences",
          newPrefs
        );
        if (response.data?.preferences) {
          setPreferences(response.data.preferences);
        }
      } catch (err) {
        console.error("Failed to update notification preferences:", err);
        fetchPreferences();
      }
    },
    [isAuthenticated, fetchPreferences]
  );

  useEffect(() => {
    if (isAuthenticated && user?.id && isMounted.current) {
      fetchNotifications(true);
      fetchUnreadCount();
      fetchPreferences();
    }
  }, [isAuthenticated, user?.id, filter]);

  useEffect(() => {
    if (!token) {
      if (websocketManager.isConnected() || websocketManager.isConnecting) {
        websocketManager.disconnect();
      }
      return;
    }
    if (!isMounted.current) return;

    const handleIncomingNotification = (data) => {
      if (!isMounted.current) return;
      const notification = data.payload?.notification;
      if (!notification) return;

      playSound();

      if (preferencesRef.current.toastEnabled) {
        setActiveToast({
          id: Date.now(),
          message: notification.message || "You have a new notification",
        });
      }

      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });

      setUnreadCount((prev) => prev + 1);
    };

    const handleNotificationRead = (data) => {
      if (!isMounted.current) return;
      const notificationId = data.payload?.notificationId;
      if (!notificationId) return;
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "read" } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleAllNotificationsRead = () => {
      if (!isMounted.current) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
      setUnreadCount(0);
    };

    const handleNotificationDeleted = (data) => {
      if (!isMounted.current) return;
      const notificationId = data.payload?.notificationId;
      if (!notificationId) return;
      setNotifications((prev) => {
        const deleted = prev.find((n) => n._id === notificationId);
        if (deleted?.status === "unread") {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== notificationId);
      });
    };

    const handleUnreadCountUpdate = (data) => {
      if (!isMounted.current) return;
      const count = data.payload?.count;
      if (typeof count === "number") setUnreadCount(count);
    };

    const handleAdminNotificationsUpdate = (data) => {
      if (!isMounted.current) return;
      const adminNotifications = data.payload?.notifications;
      if (!Array.isArray(adminNotifications)) return;
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n._id));
        const newOnes = adminNotifications.filter(
          (n) => !existingIds.has(n._id)
        );
        return [...newOnes, ...prev];
      });
    };

    websocketManager.on("notification", handleIncomingNotification);
    websocketManager.on("notificationRead", handleNotificationRead);
    websocketManager.on("allNotificationsRead", handleAllNotificationsRead);
    websocketManager.on("notificationDeleted", handleNotificationDeleted);
    websocketManager.on("unreadCountUpdate", handleUnreadCountUpdate);
    websocketManager.on(
      "adminNotificationsUpdate",
      handleAdminNotificationsUpdate
    );

    const onConnected = () => {
      if (!isMounted.current) return;
      websocketManager.subscribeToNotifications();
    };

    websocketManager.connect(token, onConnected);

    return () => {
      websocketManager.off("notification", handleIncomingNotification);
      websocketManager.off("notificationRead", handleNotificationRead);
      websocketManager.off("allNotificationsRead", handleAllNotificationsRead);
      websocketManager.off("notificationDeleted", handleNotificationDeleted);
      websocketManager.off("unreadCountUpdate", handleUnreadCountUpdate);
      websocketManager.off(
        "adminNotificationsUpdate",
        handleAdminNotificationsUpdate
      );
    };
  }, [token, playSound]);

  const fetchNotifications = useCallback(
    async (reset = true) => {
      if (!isMounted.current) return;
      try {
        setLoading(true);
        setError(null);
        const currentPage = reset ? 1 : pageRef.current;
        const response = await api.safeGet(
          `/notifications?page=${currentPage}&limit=10&filter=${filter}`
        );
        if (!isMounted.current) return;
        if (response.data) {
          const fetched = response.data.data?.notifications || [];
          const pagination = response.data.data?.pagination || {};
          setNotifications((prev) => {
            if (reset) return fetched;
            const newOnes = fetched.filter(
              (n) => !prev.some((e) => e._id === n._id)
            );
            return [...prev, ...newOnes];
          });
          pageRef.current = reset ? 2 : pageRef.current + 1;
          setHasMore(currentPage < (pagination.totalPages || 1));
        }
      } catch (err) {
        if (isMounted.current)
          setError(err.message || "Failed to fetch notifications");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [filter]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const response = await api.safeGet("/notifications/count");
      if (isMounted.current && response.data) {
        setUnreadCount(response.data.data?.totalUnread ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    if (!isMounted.current) return;
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, status: "read" } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await api.safePatch(`/notifications/${notificationId}/read`, {});
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "unread" } : n
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!isMounted.current) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
    setUnreadCount(0);

    try {
      await api.safePatch("/notifications/read-all", {});

      websocketManager.send({ type: "markAllAsRead" });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications(true);
      fetchUnreadCount();
    }
  }, [fetchNotifications, fetchUnreadCount]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!isMounted.current) return;
      // Optimistic update
      setNotifications((prev) => {
        const deleted = prev.find((n) => n._id === notificationId);
        if (deleted?.status === "unread") {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== notificationId);
      });
      try {
        await api.safeDelete(`/notifications/${notificationId}`);
      } catch (err) {
        console.error("Failed to delete notification:", err);
        fetchNotifications(true);
      }
    },
    [fetchNotifications]
  );

  const refreshNotifications = useCallback(
    () => fetchNotifications(true),
    [fetchNotifications]
  );

  const dismissToast = useCallback(() => setActiveToast(null), []);

  const value = useMemo(
    () => ({
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
      fetchUnreadCount,
      preferences,
      preferencesLoading,
      updatePreferences,
    }),
    [
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
      fetchUnreadCount,
      preferences,
      preferencesLoading,
      updatePreferences,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {activeToast && (
        <NotificationToast toast={activeToast} onDismiss={dismissToast} />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;
