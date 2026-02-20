import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import api from "../utils/api";
import websocketManager from "../utils/websocketManager";
import { useAuth } from "./AuthContext";

// Guard against missing audio file producing a broken URI.
// If src/assets/sounds/notification.mp3 doesn't exist, keep null.
let notificationSound = null;
try {
  const resolved = new URL("../assets/sounds/notification.mp3", import.meta.url)
    .href;
  // Vite returns a valid-looking URL even for missing files; verify it ends
  // with .mp3 (not "undefined") before using it.
  if (resolved?.endsWith(".mp3")) {
    notificationSound = resolved;
  }
} catch {
  notificationSound = null;
}

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all");

  const audioRef = useRef(null);
  const isMounted = useRef(true);
  const pageRef = useRef(1);

  // THE ROOT FIX (from AuthContext inspection):
  // getToken() = () => user?.token || getToken()
  // The token lives directly on the user object. Reading user?.token is always
  // in sync with the same React render that sets isAuthenticated — zero race.
  const token = user?.token ?? null;

  // ── Mounted flag ─────────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── Audio setup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && notificationSound) {
      audioRef.current = new Audio(notificationSound);
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

  // ── Fetch on auth / filter change ────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && user?.id && isMounted.current) {
      fetchNotifications(true);
      fetchUnreadCount();
    }
  }, [isAuthenticated, user?.id, filter]);

  // ── WebSocket lifecycle ───────────────────────────────────────────────────────
  // Keyed on `token` string (null = logged out, string = logged in).
  // Handlers registered BEFORE connect() so no message arrives without a handler.
  // Disconnect only when token becomes null (logout) — never in cleanup, which
  // would fire on React StrictMode's fake unmount and kill the connection.
  useEffect(() => {
    if (!token) {
      if (websocketManager.isConnected() || websocketManager.isConnecting) {
        websocketManager.disconnect();
      }
      return;
    }

    if (!isMounted.current) return;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleIncomingNotification = (data) => {
      if (!isMounted.current) return;
      const notification = data.payload?.notification;
      if (!notification) return;
      audioRef.current?.play().catch(() => {});
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

    // FIX: Only call subscribeToNotifications() — NOT subscribeToUnreadCount().
    // Backend's handleSubscribe("notifications") already calls
    // handleUnreadCountSubscription internally, so calling subscribeToUnreadCount
    // separately causes the server to send unreadCountUpdate TWICE per connection.
    const onConnected = () => {
      if (!isMounted.current) return;
      websocketManager.subscribeToNotifications();
      // ✗ Do NOT add subscribeToUnreadCount() here — backend already sends it
      //   as part of the "notifications" channel subscription above.
    };

    websocketManager.connect(token, onConnected);

    // Only deregister handlers on cleanup — never disconnect.
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
  }, [token]);

  // ── API helpers ───────────────────────────────────────────────────────────────
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
    try {
      await api.safePatch(`/notifications/${notificationId}/read`);
      if (!isMounted.current) return;
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "read" } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      await api.safePatch("/notifications/read-all");
      if (!isMounted.current) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!isMounted.current) return;
    try {
      await api.safeDelete(`/notifications/${notificationId}`);
      if (!isMounted.current) return;
      setNotifications((prev) => {
        const deleted = prev.find((n) => n._id === notificationId);
        if (deleted?.status === "unread") {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== notificationId);
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  const refreshNotifications = useCallback(
    () => fetchNotifications(true),
    [fetchNotifications]
  );

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
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
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
