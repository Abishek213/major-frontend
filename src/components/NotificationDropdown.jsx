// src/components/NotificationDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistance } from 'date-fns';
import {
  Bell, Check, Loader, 
  X, Settings, Clock,
  AlertCircle, Calendar,
  Eye, EyeOff
} from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const observerTarget = useRef(null);
  const dropdownRef = useRef(null);
  const userRole = localStorage.getItem('role');

  const {
    notifications,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    isLoading,
    error,
    pagination,
    unreadCount,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          !event.target.closest('.notifications-dropdown')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Fetch notifications when component mounts or filter changes
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, filter);
    }
  }, [isOpen, filter, fetchNotifications]);

  const getNotificationIcon = (type) => {
    const iconMap = {
      event: Calendar,
      default: Bell
    };
    const Icon = iconMap[type] || iconMap.default;
    return <Icon className="w-4 h-4" />;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      event: 'text-purple-600 bg-purple-100',
      default: 'text-gray-600 bg-gray-100'
    };
    return colorMap[type] || colorMap.default;
  };

  const formatTimestamp = (notification) => {
    try {
      const timestamp = notification.createdAt || notification.timestamp || notification.created_at;
      if (!timestamp) return 'Just now';

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Recently';

      const timeAgo = formatDistance(date, new Date(), { addSuffix: true });
      const exactTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span title={date.toLocaleString()}>{timeAgo}</span>
          <span className="text-xs opacity-75">({exactTime})</span>
        </div>
      );
    } catch (error) {
      return 'Recently';
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && pagination?.totalPages && currentPage < pagination.totalPages) {
          fetchNotifications(currentPage + 1, filter).then(() => setCurrentPage(prev => prev + 1));
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [currentPage, filter, isLoading, pagination?.totalPages, fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification._id.startsWith('temp-')) {
        await markAsRead(notification._id);
      }
      // You'll need to define navigationMap
      onClose(); // Close dropdown after clicking
    } catch (error) {
      console.error('Notification click error:', error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setCurrentPage(1);
    setFilter(newFilter);
  };

  const NotificationItem = ({ notification }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer transition-all duration-200 ${
          !notification.read ? 'bg-blue-50' : ''
        }`}
        onClick={() => handleNotificationClick(notification)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getNotificationColor(notification.type || 'default')}`}>
            {getNotificationIcon(notification.type || 'default')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm text-gray-800 line-clamp-2 ${
                !notification.read ? 'font-semibold' : ''
              }`}>
                {notification.message}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.read && (
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
              {isHovered && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                    className="p-1 rounded text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    title="Mark as read"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilterButtons = () => (
    <div className="p-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">FILTERS</h4>
        <span className="text-xs text-gray-500">
          {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All', icon: Bell },
          { id: 'unread', label: 'Unread', icon: EyeOff }
        ].map((filterItem) => {
          const Icon = filterItem.icon;
          return (
            <button
              key={`filter-${filterItem.id}`}
              onClick={() => handleFilterChange(filterItem.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                filter === filterItem.id 
                  ? 'bg-white shadow-sm border border-gray-300 text-blue-600' 
                  : 'hover:bg-white hover:shadow-sm text-gray-600'
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

  const SettingsPanel = () => (
    <div className="absolute inset-0 bg-white z-10">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={() => setShowSettings(false)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-semibold text-gray-800">Notification Settings</h3>
      </div>
      <div className="p-4">
        <div className="text-center py-8 text-gray-500">
          Notification settings will be available soon.
        </div>
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              markAllAsRead();
              setShowSettings(false);
            }}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );

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
          <div ref={observerTarget} className="h-8 flex items-center justify-center">
            {isLoading ? (
              <div className="py-4">
                <Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" />
              </div>
            ) : currentPage < pagination?.totalPages ? (
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
            {filter === 'unread' 
              ? 'All notifications are read' 
              : 'Your notifications will appear here'}
          </p>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden z-50"
    >
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
              className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                markAllAsRead();
                onClose();
              }}
              disabled={unreadCount === 0}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm ${
                unreadCount > 0 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>
      </div>

      {showSettings ? (
        <SettingsPanel />
      ) : (
        <>
          <FilterButtons />
          <NotificationsList />
        </>
      )}

      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Error</p>
            <p className="text-xs text-red-600">{error.message || 'Failed to load notifications'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;