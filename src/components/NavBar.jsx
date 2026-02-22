import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "@/context/NotificationContext";
import ConnectionStatus from "@/components/ConnectionStatus";
import websocketManager from "@/utils/websocketManager";
import { jwtDecode } from "jwt-decode";
import {
  Bell,
  User,
  LogOut,
  Settings,
  Home,
  Phone,
  Info,
  LayoutDashboard,
} from "lucide-react";
import { getUserRole, getDashboardUrl } from "@/utils/auth";

const NavBar = () => {
  const [sticky, setSticky] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const [wsConnected, setWsConnected] = useState(true);
  const [wsReconnectAttempts, setWsReconnectAttempts] = useState(0);
  const [wsMaxReconnectAttempts, setWsMaxReconnectAttempts] = useState(5);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const { unreadCount } = useNotifications();

  const isMounted = useRef(true);
  // FIX: Split into two separate refs — one for desktop, one for mobile.
  // Previously both shared the same ref, so the mobile assignment overwrote
  // the desktop one, breaking click-outside detection on desktop.
  const desktopNotificationRef = useRef(null);
  const mobileNotificationRef = useRef(null);
  const profileRef = useRef(null);
  const wsStatusInterval = useRef(null);

  // ── Auth sync ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setUserRole(getUserRole());
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        setUser(decodedToken.user);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  // ── Scroll sticky ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Click outside handler ─────────────────────────────────────────────────────
  // FIX: Now checks BOTH desktop and mobile notification refs so click-outside
  // works correctly regardless of which one the user is viewing.
  useEffect(() => {
    const handleClickOutside = (event) => {
      const insideDesktopNotif =
        desktopNotificationRef.current &&
        desktopNotificationRef.current.contains(event.target);
      const insideMobileNotif =
        mobileNotificationRef.current &&
        mobileNotificationRef.current.contains(event.target);

      if (!insideDesktopNotif && !insideMobileNotif) {
        setShowNotifications(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── WebSocket status polling ──────────────────────────────────────────────────
  useEffect(() => {
    const syncWsStatus = () => {
      if (!isMounted.current) return;
      const stats = websocketManager.getStats();
      setWsConnected(stats.connected);
      setWsReconnectAttempts(stats.reconnectAttempts);
      setWsMaxReconnectAttempts(stats.maxReconnectAttempts);
    };
    syncWsStatus();
    wsStatusInterval.current = setInterval(syncWsStatus, 2000);
    return () => {
      if (wsStatusInterval.current) {
        clearInterval(wsStatusInterval.current);
        wsStatusInterval.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    websocketManager.disconnect();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    setIsProfileOpen(false);
    setShowNotifications(false);
    setWsConnected(true);
    setWsReconnectAttempts(0);
    navigate("/loginsignup");
  }, [navigate]);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const navigationItems = useMemo(() => {
    const items = [];
    if (!isAuthenticated || (userRole && userRole !== "User")) {
      items.push({ to: "/", icon: Home, text: "Home" });
    }
    items.push({ to: "/contact", icon: Phone, text: "Contact" });
    if (!isAuthenticated) {
      items.push({ to: "/about", icon: Info, text: "About" });
    }
    return items;
  }, [isAuthenticated, userRole]);

  const isDashboardPage = useMemo(() => {
    const dashboardPaths = ["/admindb", "/orgdb", "/userdb"];
    return dashboardPaths.some((path) => location.pathname.startsWith(path));
  }, [location.pathname]);

  const handleDashboardNavigation = useCallback(() => {
    if (!userRole) return;
    const dashboardUrl = getDashboardUrl();
    if (dashboardUrl) {
      const isInDashboard = location.pathname.startsWith(dashboardUrl);
      navigate(
        isInDashboard
          ? userRole === "Organizer"
            ? "/orgdb/overview"
            : dashboardUrl
          : dashboardUrl
      );
    }
  }, [userRole, location.pathname, navigate]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────────
  const themeClasses = {
    nav: `fixed top-0 z-40 transition-all duration-300 ${
      sticky ? "bg-white/95 backdrop-blur-lg shadow-sm" : "bg-white"
    } border-b border-gray-200`,
    text: "text-gray-800",
    textMuted: "text-gray-600",
    button:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300",
    dropdownMenu:
      "absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden z-50",
  };

  // ── Renderers ─────────────────────────────────────────────────────────────────
  const renderProfileDropdown = () => (
    <div className={themeClasses.dropdownMenu}>
      <div className="p-3 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-800">
          {user?.fullname || "User"}
        </p>
        <p className="text-sm text-gray-600">
          {user?.email || "user@example.com"}
        </p>
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

  const renderNotificationButton = () => (
    // FIX: Use desktopNotificationRef instead of the shared notificationRef
    <li className="relative" ref={desktopNotificationRef}>
      <button
        onClick={toggleNotifications}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors relative"
        aria-label="Notifications"
        aria-expanded={showNotifications}
      >
        <Bell className="h-4 w-4" />
        <span className="hidden lg:inline">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[1.1rem] h-[1.1rem] flex items-center justify-center px-1 leading-none font-medium animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
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

  const renderProfileButton = () => (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Profile menu"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
          <span className="text-sm font-medium text-white">
            {user?.fullname
              ?.split(" ")
              .map((name) => name[0])
              .join("") || "U"}
          </span>
        </div>
      </button>
      {isProfileOpen && renderProfileDropdown()}
    </div>
  );

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

  const connectionStatusProps = {
    isConnected: wsConnected,
    reconnectAttempts: wsReconnectAttempts,
    maxReconnectAttempts: wsMaxReconnectAttempts,
  };

  const renderDashboardNavbar = () => (
    <div
      className={`${themeClasses.nav} right-0 transition-all duration-300`}
      style={{
        width: isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4rem)",
        marginLeft: isSidebarOpen ? "16rem" : "4rem",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="justify-center flex-1 hidden lg:flex">
            <ul className="flex items-center gap-6">{renderNavLinks()}</ul>
          </div>
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
      <ConnectionStatus {...connectionStatusProps} />
    </div>
  );

  const renderRegularNavbar = () => (
    <div className={`${themeClasses.nav} w-full`}>
      <div className="px-4 py-3 mx-auto max-w-7xl">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="flex items-center">
            <img
              src="/images/e-VENTA.png"
              alt="Eventa Logo"
              className="w-auto h-16"
            />
          </Link>
          <div className="hidden lg:flex justify-center flex-1">
            <ul className="flex items-center gap-8">{renderNavLinks()}</ul>
          </div>
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
      <ConnectionStatus {...connectionStatusProps} />
    </div>
  );

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
            {/* FIX: Use mobileNotificationRef instead of the shared notificationRef */}
            <div ref={mobileNotificationRef} className="relative">
              <button
                onClick={toggleNotifications}
                className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="text-xs mt-1">Alerts</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full min-w-[1rem] h-4 flex items-center justify-center px-1 leading-none font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute bottom-14 right-0">
                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex flex-col items-center p-2"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user?.fullname
                    ?.split(" ")
                    .map((name) => name[0])
                    .join("") || "U"}
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