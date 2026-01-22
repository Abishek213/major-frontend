import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useSidebar } from '@/context/SidebarContext';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '@/context/NotificationContext';
import ConnectionStatus from '@/components/ConnectionStatus';
import websocketManager from '@/utils/websocketManager';
import { jwtDecode } from "jwt-decode";
import {
  Bell, User, LogOut, Settings,
  Plus, Menu, Home, Phone, Info,
  LayoutDashboard, Calendar, HelpCircle
} from 'lucide-react';

// Import auth functions
import { getUserRole, getDashboardUrl } from '@/utils/auth';

const NavBar = () => {
  const [sticky, setSticky] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const { toggleNotifications, unreadCount } = useNotifications();
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;

  const isAuthenticated = localStorage.getItem('token');
  const userRole = getUserRole(); // Use imported function

  const themeClasses = {
    nav: `fixed top-0 z-40 transition-all duration-300 ${sticky
      ? 'bg-white/95'
      : 'bg-white'
      } border-b border-gray-200 backdrop-blur-lg`,
    text: 'text-gray-800',
    textMuted: 'text-gray-600',
    button: `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300`,
    dropdownMenu: `absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden`
  };

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const decodedToken = jwtDecode(isAuthenticated);
        setUser(decodedToken.user);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const notificationHandler = (data) => {
      console.log('Received notification response:', data);
    };

    return () => {
      websocketManager.off('notification', notificationHandler);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
    };

    const handleOffline = () => {
      setIsConnected(false);
      if (reconnectAttempts < maxReconnectAttempts) {
        setReconnectAttempts(prev => prev + 1);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [reconnectAttempts, maxReconnectAttempts]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/loginsignup');
  };

  const getNavigationItems = () => {
    // Common items for everyone
    const commonItems = [];

    // Show Home menu only for:
    // 1. Non-authenticated users
    // 2. Organizers
    // 3. Admins
    // NOT for Users (role === 'User')
    if (!isAuthenticated || (userRole && userRole !== 'User')) {
      commonItems.push({ to: "/", icon: Home, text: "Home" });
    }

    // Contact page for everyone
    commonItems.push({ to: "/contact", icon: Phone, text: "Contact" });

    // About page only for non-authenticated users
    if (!isAuthenticated) {
      commonItems.push({ to: "/about", icon: Info, text: "About" });
    }

    return commonItems;
  };

  const isDashboardPage = () => {
    const dashboardPaths = ['/admindb', '/orgdb', '/userdb']; // Use /orgdb instead of /organizerdb
    return dashboardPaths.some(path => location.pathname.startsWith(path));
  };

  const handleDashboardNavigation = () => {
    if (!userRole) return;
    
    console.log('Dashboard navigation clicked for role:', userRole);
    console.log('Current path:', location.pathname);
    
    // Use the getDashboardUrl function from auth.js
    const dashboardUrl = getDashboardUrl();
    console.log('Dashboard URL from auth.js:', dashboardUrl);
    
    if (dashboardUrl) {
      // Check if we're already in the dashboard
      const isInDashboard = location.pathname.startsWith(dashboardUrl);
      
      if (isInDashboard) {
        // If we're already in the dashboard, navigate to the overview
        // For organizer, navigate to overview page
        if (userRole === 'Organizer') {
          navigate('/orgdb/overview');
        } else {
          navigate(dashboardUrl);
        }
      } else {
        // If we're not in the dashboard, navigate to it
        navigate(dashboardUrl);
      }
    }
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
                {/* Regular navigation items */}
                {getNavigationItems().map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.text}
                    </Link>
                  </li>
                ))}

                {/* Dashboard menu item in center for authenticated users */}
                {isAuthenticated && userRole && (
                  <li>
                    <button
                      onClick={handleDashboardNavigation}
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                  </li>
                )}

                {/* Notifications menu item in center for authenticated users */}
                {isAuthenticated && (
                  <li className="relative notifications-dropdown">
                    <button
                      onClick={toggleNotifications}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 relative"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown />
                  </li>
                )}
              </ul>
            </div>

            {/* Right Section - Only Profile Dropdown remains */}
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <Link to="/loginsignup" className={`px-6 py-2 rounded-full ${themeClasses.button}`}>
                  Login
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Profile Dropdown */}
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100"
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
                          <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100">
                            <User className="w-4 h-4" /><span>Profile</span>
                          </Link>
                          <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100">
                            <Settings className="w-4 h-4" /><span>Settings</span>
                          </Link>
                          <button onClick={handleLogout} className="flex items-center w-full gap-2 px-3 py-2 text-red-500 rounded-lg hover:bg-red-50">
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
              <img src='/images/eventa.png' alt="logo" className="w-auto h-16" />
            </Link>

            {/* Center Menu */}
            <div className="hidden lg:flex justify-center flex-1">
              <ul className="flex items-center gap-8">
                {/* Regular navigation items */}
                {getNavigationItems().map((item) => (
                  <li key={item.to}>
                    <Link 
                      to={item.to} 
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.text}
                    </Link>
                  </li>
                ))}

                {/* Dashboard menu item in center for authenticated users */}
                {isAuthenticated && userRole && (
                  <li>
                    <button
                      onClick={handleDashboardNavigation}
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                  </li>
                )}

                {/* Notifications menu item in center for authenticated users */}
                {isAuthenticated && (
                  <li className="relative notifications-dropdown">
                    <button
                      onClick={toggleNotifications}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 relative"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown />
                  </li>
                )}
              </ul>
            </div>

            {/* Right Side - Only Profile/Login remains */}
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <Link to="/loginsignup" className={`px-6 py-2 rounded-full ${themeClasses.button}`}>
                  Login
                </Link>
              ) : (
                <>
                  {/* Profile Dropdown */}
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100"
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
                          <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100">
                            <User className="w-4 h-4" /><span>Profile</span>
                          </Link>
                          <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:bg-gray-100">
                            <Settings className="w-4 h-4" /><span>Settings</span>
                          </Link>
                          <button onClick={handleLogout} className="flex items-center w-full gap-2 px-3 py-2 text-red-500 rounded-lg hover:bg-red-50">
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