import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "@/Pages/Landing/Home";
import About from "@/Pages/Landing/About";
import PublicEvent from "@/Pages/Landing/PublicEvent";
import LoginSignup from "@/Pages/Landing/LoginSignup";
import Contact from "@/Pages/Landing/Contact";
import Userprofile from "@/Pages/Landing/Userprofile";
import UserSettings from "@/Pages/Landing/UserSettings";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import {
  organizerDashboardConfig,
  adminDashboardConfig,
  userDashboardConfig,
} from "./config/dashboardConfig";

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router
      future={{
        v7_startTransition: true, // Wraps state updates in React.startTransition
        v7_relativeSplatPath: true, // Fixes relative route resolution inside splat routes
      }}
    >
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/event" element={<PublicEvent />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/loginsignup" element={<LoginSignup />} />
          <Route path="/profile" element={<Userprofile />} />
          <Route path="/settings" element={<UserSettings />} />

          {/* Protected Routes */}
          <Route
            path="/admindb/*"
            element={
              <PrivateRoute
                element={Dashboard}
                requiredRole="Admin"
                config={adminDashboardConfig}
              />
            }
          />
          <Route
            path="/orgdb/*"
            element={
              <PrivateRoute
                element={Dashboard}
                requiredRole="Organizer"
                config={organizerDashboardConfig}
              />
            }
          />
          <Route
            path="/userdb/*"
            element={
              <PrivateRoute
                element={Dashboard}
                requiredRole="User"
                config={userDashboardConfig}
              />
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
