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
  const userRole = localStorage.getItem('role');

  const themeClasses = {
    nav: `fixed top-0 z-40 transition-all duration-300 ${
      sticky 
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
    window.location.href = '/loginsignup';
  };

  const getNavigationItems = () => {
    if (!isAuthenticated || (isAuthenticated && userRole === 'User')) {
      const commonItems = [
        { to: "/", icon: Home, text: "Home" }
      ];
  
      if (!isAuthenticated) {
        commonItems.push(
          { to: "/event", icon: Calendar, text: "Events" },
          { to: "/contact", icon: Phone, text: "Contact" },
          { to: "/about", icon: Info, text: "About" }
        );
      } else {
        commonItems.push(
          { to: "/contact", icon: Phone, text: "Contact" }
        );
      }
  
      return commonItems;
    }
    return [];
  };

  const isDashboardPage = () => {
    const dashboardPaths = ['/admindb', '/orgdb', '/userdb'];
    return dashboardPaths.some(path => location.pathname.startsWith(path));
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
            {/* Logo Left */}
            <Link to="/" className="flex items-center">
              <img src='/images/eventa.png' alt="logo" className="h-12 w-auto" />
            </Link>

            {/* Center Navigation */}
            <div className="hidden lg:flex justify-center flex-1">
              <ul className="flex items-center gap-6">
                {getNavigationItems().map((item) => (
                  <li key={item.to}>
                    <Link 
                      to={item.to} 
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <Link to="/loginsignup" className={`px-6 py-2 rounded-full ${themeClasses.button}`}>
                  Login
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  {userRole?.toLowerCase() === 'user' && (
                    <button
                      onClick={() => navigate('/userdb')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full ${themeClasses.button}`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                  )}

                  {/* Notifications */}
                  <div className="relative notifications-dropdown">
                    <button
                      onClick={toggleNotifications}
                      className="p-2 hover:bg-gray-100 rounded-full relative"
                    >
                      <Bell className="w-6 h-6 text-gray-800" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown />
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
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
                          <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800">
                            <User className="h-4 w-4" /><span>Profile</span>
                          </Link>
                          <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800">
                            <Settings className="h-4 w-4" /><span>Settings</span>
                          </Link>
                          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50">
                            <LogOut className="h-4 w-4" /><span>Sign Out</span>
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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src='/images/eventa.png' alt="logo" className="h-16 w-auto" />
            </Link>

            {/* Center Menu */}
            <div className="hidden lg:flex justify-center flex-1">
              <ul className="flex items-center gap-16">
                {getNavigationItems().map((item) => (
                  <li key={item.to}>
                    <Link 
                      to={item.to} 
                      className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side (Login/Profile) */}
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <Link to="/loginsignup" className={`px-6 py-2 rounded-full ${themeClasses.button}`}>
                  Login
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  {userRole?.toLowerCase() === 'user' && (
                    <button
                      onClick={() => navigate('/userdb')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full ${themeClasses.button}`}
                    >
                      <LayoutDashboard className="h-4 w-4" /><span>Dashboard</span>
                    </button>
                  )}

                  <div className="relative notifications-dropdown">
                    <button
                      onClick={toggleNotifications}
                      className="p-2 hover:bg-gray-100 rounded-full relative"
                    >
                      <Bell className="w-6 h-6 text-gray-800" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown />
                  </div>

                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
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
                          <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800">
                            <User className="h-4 w-4" /><span>Profile</span>
                          </Link>
                          <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800">
                            <Settings className="h-4 w-4" /><span>Settings</span>
                          </Link>
                          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50">
                            <LogOut className="h-4 w-4" /><span>Sign Out</span>
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

  return isDashboardPage() ? renderDashboardNavbar() : renderRegularNavbar();
};

export default NavBar;