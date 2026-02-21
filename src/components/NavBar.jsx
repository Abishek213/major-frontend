// src/components/NavBar.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

// Constants
const MAX_RECONNECT_ATTEMPTS = 3;

const NavBar = () => {
  const [sticky, setSticky] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const { unreadCount } = useNotifications();
  
  // Use refs to prevent unnecessary re-renders
  const isMounted = useRef(true);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Update auth state when token changes or route changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setUserRole(getUserRole());
  }, [location.pathname]); // Re-check when route changes

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

  // Combined click outside handler for both dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check notifications dropdown
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      // Check profile dropdown
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
        setUser(null);
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

  // WebSocket notification handler with cleanup
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
        setReconnectAttempts(prev => 
          prev < MAX_RECONNECT_ATTEMPTS ? prev + 1 : prev
        );
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      isMounted.current = false;
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    setIsProfileOpen(false);
    setShowNotifications(false);
    navigate('/loginsignup');
  }, [navigate]);

  // Memoize navigation items
  const navigationItems = useMemo(() => {
    const items = [];

    if (!isAuthenticated || (userRole && userRole !== 'User')) {
      items.push({ to: "/", icon: Home, text: "Home" });
    }

    items.push({ to: "/contact", icon: Phone, text: "Contact" });

    if (!isAuthenticated) {
      items.push({ to: "/about", icon: Info, text: "About" });
    }

    return items;
  }, [isAuthenticated, userRole]);

  // Memoize dashboard page check
  const isDashboardPage = useMemo(() => {
    const dashboardPaths = ['/admindb', '/orgdb', '/userdb'];
    return dashboardPaths.some(path => location.pathname.startsWith(path));
  }, [location.pathname]);

  // Memoize dashboard navigation handler
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

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  // Profile dropdown content
  const renderProfileDropdown = () => (
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
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>
        <Link 
          to="/settings" 
          className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsProfileOpen(false)}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
        <button 
          onClick={handleLogout} 
          className="flex items-center w-full gap-2 px-3 py-2 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Notification button with badge
  const renderNotificationButton = () => (
    <li className="relative" ref={notificationRef}>
      <button
        onClick={toggleNotifications}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden lg:inline">Notifications</span>
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
  );

  // Profile button
  const renderProfileButton = () => (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Profile menu"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
          <span className="text-sm font-medium text-white">
            {user?.fullname?.split(' ').map(name => name[0]).join('') || 'U'}
          </span>
        </div>
      </button>
      {isProfileOpen && renderProfileDropdown()}
    </div>
  );

  // Navigation links
  const renderNavLinks = () => (
    <>
      {navigationItems.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.text}</span>
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

      {isAuthenticated && renderNotificationButton()}
    </>
  );

  // Dashboard navbar
  const renderDashboardNavbar = () => (
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
              {renderNavLinks()}
            </ul>
          </div>

          {/* Right Section - Profile/Login */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <Link 
                to="/loginsignup" 
                className={`px-6 py-2 rounded-full ${themeClasses.button}`}
              >
                Login
              </Link>
            ) : (
              renderProfileButton()
            )}
          </div>
        </div>
      </div>
      <ConnectionStatus 
        isConnected={isConnected} 
        reconnectAttempts={reconnectAttempts} 
        maxReconnectAttempts={MAX_RECONNECT_ATTEMPTS} 
      />
    </div>
  );

  // Regular navbar
  const renderRegularNavbar = () => (
    <div className={`${themeClasses.nav} w-full`}>
      <div className="px-4 py-3 mx-auto max-w-7xl">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src='/images/e-VENTA.png' alt="Eventa Logo" className="w-auto h-16" />
          </Link>

          {/* Center Menu */}
          <div className="hidden lg:flex justify-center flex-1">
            <ul className="flex items-center gap-8">
              {renderNavLinks()}
            </ul>
          </div>

          {/* Right Side - Profile/Login */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <Link 
                to="/loginsignup" 
                className={`px-6 py-2 rounded-full ${themeClasses.button}`}
              >
                Login
              </Link>
            ) : (
              renderProfileButton()
            )}
          </div>
        </div>
      </div>
      <ConnectionStatus 
        isConnected={isConnected} 
        reconnectAttempts={reconnectAttempts} 
        maxReconnectAttempts={MAX_RECONNECT_ATTEMPTS} 
      />
    </div>
  );

  // Mobile navigation for smaller screens
  const renderMobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center p-2">
        {navigationItems.slice(0, 3).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.text}</span>
          </Link>
        ))}
        {isAuthenticated && (
          <>
            <button
              onClick={toggleNotifications}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="text-xs mt-1">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex flex-col items-center p-2"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user?.fullname?.split(' ').map(name => name[0]).join('') || 'U'}
                </span>
              </div>
              <span className="text-xs mt-1">Profile</span>
            </button>
          </>
        )}
        {!isAuthenticated && (
          <Link
            to="/loginsignup"
            className="flex flex-col items-center p-2 text-blue-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Login</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isDashboardPage ? renderDashboardNavbar() : renderRegularNavbar()}
      {renderMobileNav()}
    </>
  );
};

export default NavBar;