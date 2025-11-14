import React, { createContext, useContext, useState } from 'react';
import { getToken, setAuth, clearAuth, getUserRole, isAuthenticated } from '../utils/auth';

const AuthContext = createContext(null);

const safeDecodeToken = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      if (isAuthenticated()) {
        const token = getToken();
        const role = getUserRole();
        const decodedToken = safeDecodeToken(token);
        
        return {
          token,
          role,
          id: decodedToken?.id || null,
          // Add other user properties as needed
        };
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      clearAuth(); // Clear potentially corrupted auth state
    }
    return null;
  });

  const login = async (token, role) => {
    try {
      setAuth(token, role);
      const decodedToken = safeDecodeToken(token);
      setUser({
        token,
        role,
        id: decodedToken?.id || null,
        // Add other user properties as needed
      });
    } catch (error) {
      console.error('Error during login:', error);
      clearAuth();
      setUser(null);
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    try {
      clearAuth();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear user state even if clearing localStorage fails
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;