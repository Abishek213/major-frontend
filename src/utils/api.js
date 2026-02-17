// src/utils/api.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Get environment variables
const IS_DEV = import.meta.env.DEV;
const SUPPRESS_404_LOGS = import.meta.env.VITE_SUPPRESS_404_LOGS === 'true';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Helper function to get user data from token
export const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token');
            return null;
        }
    }
    return null;
};

// Custom error class for API errors
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Add request interceptor for token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(new ApiError('Request configuration error', null, error));
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/loginsignup';
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

// Helper function to make API calls with better error handling
const makeApiCall = async (method, url, data = null, config = {}) => {
    try {
        // Only log in development
        if (IS_DEV) {
            console.log(`Making ${method.toUpperCase()} request to ${url}`);
        }
        
        const axiosConfig = {
            method,
            url,
            ...config,
            validateStatus: null
        };

        // Only add data if it's not a DELETE request or if specifically required
        if (method.toLowerCase() !== 'delete' || data) {
            axiosConfig.data = data;
        }

        const response = await api(axiosConfig);
        
        // Log response details in development
        if (IS_DEV) {
            console.log('Raw response:', {
                status: response.status,
                url: url,
                data: response.data
            });
        }

        // Handle non-200 status codes
        if (response.status >= 200 && response.status < 300) {
            if (response.status === 204 || !response.data) {
                return {
                    status: response.status,
                    data: null,
                    headers: response.headers
                };
            }
            return response;
        }
        
        throw new ApiError(
            response.data?.message || 'Request failed',
            response.status,
            response.data
        );
    } catch (error) {
        // Check if this is a 404 error
        const is404 = error.response?.status === 404 || error.status === 404;
        
        // In development, log 404s as info (not errors) unless suppressed
        if (IS_DEV) {
            if (is404 && SUPPRESS_404_LOGS) {
                // Silent mode - don't log anything
                console.log(`📋 404 Not Found (expected): ${method.toUpperCase()} ${url}`);
            } else if (is404) {
                console.log(`📋 404 Not Found: ${method.toUpperCase()} ${url}`);
            } else {
                console.error('API call error:', {
                    name: error.name,
                    message: error.message,
                    status: error.response?.status,
                    url: url,
                    method: method.toUpperCase(),
                    data: error.response?.data
                });
            }
        }

        // Create standardized error object
        if (error.response) {
            const errorData = error.response.data || { message: 'Unknown error occurred' };
            const apiError = new ApiError(
                errorData.message || 'Request failed',
                error.response.status,
                errorData
            );
            
            // Add special handling for 404 - return empty array/data instead of throwing
            if (error.response.status === 404) {
                // Return a special response that indicates "no data" rather than throwing
                const emptyResponse = {
                    status: 404,
                    data: {
                        message: 'No data found',
                        // Provide empty structure based on the endpoint
                        ...(url.includes('event-requests-for-user') && { eventRequests: [] }),
                        ...(url.includes('notifications') && { notifications: [], hasMore: false }),
                        ...(url.includes('bookings') && { bookings: [] })
                    },
                    headers: error.response.headers
                };
                return emptyResponse;
            }
            
            throw apiError;
        }
        
        throw new ApiError(error.message || 'API call failed', null, error);
    }
};

// Export enhanced API methods
export default {
    ...api,
    safeGet: (url, config) => makeApiCall('get', url, null, config),
    safePost: (url, data, config) => makeApiCall('post', url, data, config),
    safePut: (url, data, config) => makeApiCall('put', url, data, config),
    safePatch: (url, data, config) => makeApiCall('patch', url, data, config),
    safeDelete: (url, config) => makeApiCall('delete', url, null, config)
};

// Also export individual methods for convenience
export const safeGet = (url, config) => makeApiCall('get', url, null, config);
export const safePost = (url, data, config) => makeApiCall('post', url, data, config);
export const safePut = (url, data, config) => makeApiCall('put', url, data, config);
export const safePatch = (url, data, config) => makeApiCall('patch', url, data, config);
export const safeDelete = (url, config) => makeApiCall('delete', url, null, config);