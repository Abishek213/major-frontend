import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";
import { formatDistance } from "date-fns";
import {
  Bell,
  Check,
  Loader,
  X,
  Settings,
  Clock,
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const observerTarget = useRef(null);
  const userRole = localStorage.getItem("role");

  const {
    notifications,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    loading,
    error,
    hasMore,
    unreadCount,
    preferences = { soundEnabled: true, toastEnabled: true },
    preferencesLoading,
    updatePreferences,
  } = useNotifications();

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
    }
  }, [isOpen, fetchNotifications]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          fetchNotifications(false).then(() => {
            setCurrentPage((prev) => prev + 1);
          });
        }
      },
      { threshold: 0.5 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, hasMore, fetchNotifications]);

  // Helpers
  const getNotificationIcon = (type) => {
    const iconMap = {
      event: Calendar,
      event_request: Calendar,
      event_response: Calendar,
      event_update: Calendar,
      default: Bell,
    };
    const Icon = iconMap[type] || iconMap.default;
    return <Icon className="w-4 h-4" />;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      event: "text-purple-600 bg-purple-100",
      event_request: "text-purple-600 bg-purple-100",
      event_response: "text-blue-600 bg-blue-100",
      event_update: "text-indigo-600 bg-indigo-100",
      system_notification: "text-gray-600 bg-gray-100",
      profile_update: "text-green-600 bg-green-100",
      default: "text-gray-600 bg-gray-100",
    };
    return colorMap[type] || colorMap.default;
  };

  const formatTimestamp = (notification) => {
    try {
      const timestamp =
        notification.createdAt ||
        notification.timestamp ||
        notification.created_at;
      if (!timestamp) return "Just now";
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Recently";
      const timeAgo = formatDistance(date, new Date(), { addSuffix: true });
      const exactTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span title={date.toLocaleString()}>{timeAgo}</span>
          <span className="text-xs opacity-75">({exactTime})</span>
        </div>
      );
    } catch {
      return "Recently";
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (
        !notification._id.startsWith("temp-") &&
        notification.status !== "read"
      ) {
        await markAsRead(notification._id);
      }
      onClose();
    } catch (err) {
      console.error("Notification click error:", err);
    }
  };

  const handleFilterChange = (newFilter) => {
    setCurrentPage(1);
    setFilter(newFilter);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  // NotificationItem
  const NotificationItem = ({ notification }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isUnread = notification.status !== "read";

    return (
      <div
        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer transition-all duration-200 ${
          isUnread ? "bg-blue-50" : ""
        }`}
        onClick={() => handleNotificationClick(notification)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(
              notification.type || "default"
            )}`}
          >
            {getNotificationIcon(notification.type || "default")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-sm text-gray-800 line-clamp-2 ${
                  isUnread ? "font-semibold" : ""
                }`}
              >
                {notification.message}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {isUnread && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
                {isHovered && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete notification"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-600">
                {formatTimestamp(notification)}
              </div>
              {isHovered && isUnread && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification._id);
                  }}
                  className="p-1 rounded text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                  title="Mark as read"
                >
                  <Eye className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // FilterButtons
  const FilterButtons = () => (
    <div className="p-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          FILTERS
        </h4>
        <span className="text-xs text-gray-500">
          {unreadCount > 0 ? `${unreadCount} unread` : "All read"}
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All", icon: Bell },
          { id: "unread", label: "Unread", icon: EyeOff },
        ].map((filterItem) => {
          const Icon = filterItem.icon;
          return (
            <button
              key={`filter-${filterItem.id}`}
              onClick={() => handleFilterChange(filterItem.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                filter === filterItem.id
                  ? "bg-white shadow-sm border border-gray-300 text-blue-600"
                  : "hover:bg-white hover:shadow-sm text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{filterItem.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // SettingsPanel with height fix and safe defaults
  const SettingsPanel = () => {
    const [localPrefs, setLocalPrefs] = useState(preferences);

    useEffect(() => {
      setLocalPrefs(preferences);
    }, [preferences]);

    const handleToggle = (key) => {
      const current = localPrefs || { soundEnabled: true, toastEnabled: true };
      const newPrefs = { ...current, [key]: !current[key] };
      setLocalPrefs(newPrefs);
      updatePreferences(newPrefs);
    };

    return (
      <div className="absolute inset-0 bg-white z-10 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 sticky top-0 bg-white">
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-gray-800">Notification Settings</h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Sound toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Sound</p>
              <p className="text-sm text-gray-500">
                Play a sound when new notification arrives
              </p>
            </div>
            <button
              onClick={() => handleToggle("soundEnabled")}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                localPrefs?.soundEnabled ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                  localPrefs?.soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Toast toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Toast Popups</p>
              <p className="text-sm text-gray-500">
                Show a temporary notification popup
              </p>
            </div>
            <button
              onClick={() => handleToggle("toastEnabled")}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                localPrefs?.toastEnabled ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                  localPrefs?.toastEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {preferencesLoading && (
            <div className="flex justify-center py-2">
              <Loader className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // NotificationsList
  const NotificationsList = () => (
    <div className="max-h-96 overflow-y-auto">
      {notifications.length > 0 ? (
        <>
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id || `temp-${Date.now()}-${Math.random()}`}
                notification={notification}
              />
            ))}
          </div>
          <div
            ref={observerTarget}
            className="h-8 flex items-center justify-center"
          >
            {loading ? (
              <div className="py-4">
                <Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" />
              </div>
            ) : hasMore ? (
              <div className="py-2 text-xs text-gray-500">
                Scroll to load more...
              </div>
            ) : (
              <div className="py-4 text-xs text-gray-500 text-center">
                You've reached the end
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === "unread"
              ? "All notifications are read"
              : "Your notifications will appear here"}
          </p>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className={`absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden z-50 ${
        showSettings ? "h-[350px]" : ""
      }`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <p className="text-xs text-gray-600">
                {notifications.length} total • {unreadCount} unread
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            {/* Mark All Read button */}
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markingAll}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm transition-all ${
                unreadCount > 0 && !markingAll
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title={
                unreadCount === 0
                  ? "No unread notifications"
                  : "Mark all as read"
              }
            >
              {markingAll ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{markingAll ? "Marking…" : "Mark All Read"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {showSettings ? (
        <SettingsPanel />
      ) : (
        <>
          <FilterButtons />
          <NotificationsList />
        </>
      )}

      {/* Error banner */}
      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Error</p>
            <p className="text-xs text-red-600">
              {typeof error === "string"
                ? error
                : error.message || "Failed to load notifications"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
