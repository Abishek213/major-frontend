// src/components/NavBar.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/context/SidebarContext';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '@/context/NotificationContext';
import ConnectionStatus from '@/components/ConnectionStatus';
import websocketManager from '@/utils/websocketManager';
import { jwtDecode } from "jwt-decode";
import {
  Bell, User, LogOut, Settings,
  Home, Phone, Info,
  LayoutDashboard
} from 'lucide-react';

// Import auth functions
import { getUserRole, getDashboardUrl } from '@/utils/auth';

const NavBar = () => {
  const [sticky, setSticky] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const { unreadCount } = useNotifications();
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;
  
  // Use refs to prevent unnecessary re-renders
  const isMounted = useRef(true);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = getUserRole();

  const themeClasses = {
    nav: `fixed top-0 z-40 transition-all duration-300 ${sticky
      ? 'bg-white/95 backdrop-blur-lg shadow-sm'
      : 'bg-white'
      } border-b border-gray-200`,
    text: 'text-gray-800',
    textMuted: 'text-gray-600',
    button: `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300`,
    dropdownMenu: `absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden z-50`
  };

  // Handle click outside for notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set user from token
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        setUser(decodedToken.user);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  // Handle scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // WebSocket notification handler
  useEffect(() => {
    const notificationHandler = (data) => {
      console.log('Received notification response:', data);
    };

    websocketManager.on('notification', notificationHandler);

    return () => {
      websocketManager.off('notification', notificationHandler);
    };
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (isMounted.current) {
        setIsConnected(true);
        setReconnectAttempts(0);
      }
    };

    const handleOffline = () => {
      if (isMounted.current) {
        setIsConnected(false);
        setReconnectAttempts(prev => {
          const newAttempts = prev + 1;
          return newAttempts <= maxReconnectAttempts ? newAttempts : prev;
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      isMounted.current = false;
    };
  }, [maxReconnectAttempts]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/loginsignup');
  };

  const getNavigationItems = useCallback(() => {
    const commonItems = [];

    if (!isAuthenticated || (userRole && userRole !== 'User')) {
      commonItems.push({ to: "/", icon: Home, text: "Home" });
    }

    commonItems.push({ to: "/contact", icon: Phone, text: "Contact" });

    if (!isAuthenticated) {
      commonItems.push({ to: "/about", icon: Info, text: "About" });
    }

    return commonItems;
  }, [isAuthenticated, userRole]);

  const isDashboardPage = useCallback(() => {
    const dashboardPaths = ['/admindb', '/orgdb', '/userdb'];
    return dashboardPaths.some(path => location.pathname.startsWith(path));
  }, [location.pathname]);

  const handleDashboardNavigation = useCallback(() => {
    if (!userRole) return;
    
    const dashboardUrl = getDashboardUrl();
    
    if (dashboardUrl) {
      const isInDashboard = location.pathname.startsWith(dashboardUrl);
      
      if (isInDashboard) {
        if (userRole === 'Organizer') {
          navigate('/orgdb/overview');
        } else {
          navigate(dashboardUrl);
        }
      } else {
        navigate(dashboardUrl);
      }
    }
  }, [userRole, location.pathname, navigate]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const renderDashboardNavbar = () => {
    return (
      <div
        className={`${themeClasses.nav} right-0 transition-all duration-300`}
        style={{
          width: isSidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 4rem)',
          marginLeft: isSidebarOpen ? '16rem' : '4rem',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Center Navigation */}
            <div className="justify-center flex-1 hidden lg:flex">
              <ul className="flex items-center gap-6">
                {getNavigationItems().map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.text}
                    </Link>
                  </li>
                ))}

                {isAuthenticated && userRole && (
                  <li>
                    <button
                      onClick={handleDashboardNavigation}
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                  </li>
                )}

                {/* Manual Notification Button */}
                {isAuthenticated && (
                  <li className="relative" ref={notificationRef}>
                    <button
                      onClick={toggleNotifications}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <NotificationDropdown 
                        isOpen={showNotifications} 
                        onClose={() => setShowNotifications(false)} 
                      />
                    )}
                  </li>
                )}
              </ul>
            </div>

            {/* Right Section - Profile Dropdown */}
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <Link to="/loginsignup" className={`px-6 py-2 rounded-full ${themeClasses.button}`}>
                  Login
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                        <span className="text-sm font-medium text-white">
                          {user?.fullname?.split(' ').map(name => name[0]).join('') || 'U'}
                        </span>
                      </div>
                    </button>

                    {isProfileOpen && (
                      <div className={themeClasses.dropdownMenu}>
                        <div className="p-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-800">{user?.fullname || 'User'}</p>
                          <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                        </div>
                        <div className="p-2">
                          <Link 
                            to="/profile" 
                            className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="w-4 h-4" /><span>Profile</span>
                          </Link>
                          <Link 
                            to="/settings" 
                            className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4" /><span>Settings</span>
                          </Link>
                          <button 
                            onClick={handleLogout} 
                            className="flex items-center w-full gap-2 px-3 py-2 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /><span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <ConnectionStatus isConnected={isConnected} reconnectAttempts={reconnectAttempts} maxReconnectAttempts={maxReconnectAttempts} />
      </div>
    );
  };

  const renderRegularNavbar = () => {
    return (
      <div className={`${themeClasses.nav} w-full`}>
        <div className="px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src='/images/eventA.png' alt="logo" className="w-auto h-16" />
            </Link>

            {/* Center Menu */}
            <div className="hidden lg:flex justify-center flex-1">
              <ul className="flex items-center gap-8">
                {getNavigationItems().map((item) => (
                  <li key={item.to}>
                    <Link 
                      to={item.to} 
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.text}
                    </Link>
                  </li>
                ))}

                {isAuthenticated && userRole && (
                  <li>
                    <button
                      onClick={handleDashboardNavigation}
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                  </li>
                )}

                {/* Manual Notification Button */}
                {isAuthenticated && (
                  <li className="relative" ref={notificationRef}>
                    <button
                      onClick={toggleNotifications}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <NotificationDropdown 
                        isOpen={showNotifications} 
                        onClose={() => setShowNotifications(false)} 
                      />
                    )}
                  </li>
                )}
              </ul>
            </div>

            {/* Right Side - Profile/Login */}
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <Link to="/loginsignup" className={`px-6 py-2 rounded-full ${themeClasses.button}`}>
                  Login
                </Link>
              ) : (
                <>
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                        <span className="text-sm font-medium text-white">
                          {user?.fullname?.split(' ').map(name => name[0]).join('') || 'U'}
                        </span>
                      </div>
                    </button>

                    {isProfileOpen && (
                      <div className={themeClasses.dropdownMenu}>
                        <div className="p-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-800">{user?.fullname || 'User'}</p>
                          <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                        </div>
                        <div className="p-2">
                          <Link 
                            to="/profile" 
                            className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="w-4 h-4" /><span>Profile</span>
                          </Link>
                          <Link 
                            to="/settings" 
                            className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4" /><span>Settings</span>
                          </Link>
                          <button 
                            onClick={handleLogout} 
                            className="flex items-center w-full gap-2 px-3 py-2 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /><span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <ConnectionStatus isConnected={isConnected} reconnectAttempts={reconnectAttempts} maxReconnectAttempts={maxReconnectAttempts} />
      </div>
    );
  };

  return isDashboardPage() ? renderDashboardNavbar() : renderRegularNavbar();
};

export default NavBar;