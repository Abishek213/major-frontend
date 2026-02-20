import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getDecodedToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Ensure user ID exists (adjust based on your token structure)
    if (!decoded.userId && !decoded.sub) {
      console.error("Token missing user ID");
      return null;
    }
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Function to set token and role
export const setAuth = (token, role) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
};

// Function to clear auth data
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

// Function to get the user's role from the JWT token
export const getUserRole = () => {
  const token = getToken();
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      // Adjust based on where role is stored in your token (e.g., decodedToken.role)
      return decodedToken?.role || localStorage.getItem("role");
    } catch (error) {
      console.error("Error decoding token:", error);
      // Fallback to localStorage role if token decoding fails
      return localStorage.getItem("role");
    }
  }
  return null;
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  const role = localStorage.getItem("role");

  if (!token || !role) {
    return false;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp && decodedToken.exp < currentTime) {
      clearAuth(); // Clear expired token
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

// Function to validate role
export const hasRole = (requiredRole) => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};

// Function to get dashboard URL based on role
export const getDashboardUrl = () => {
  const role = getUserRole();
  switch (role) {
    case "Admin":
      return "/admindb";
    case "Organizer":
      return "/orgdb";
    case "User":
      return "/userdb";
    default:
      return "/";
  }
};
