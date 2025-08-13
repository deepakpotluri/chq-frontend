// services/api.js
import axios from 'axios';

// Get API URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Ensure the URL doesn't have a trailing slash
const baseURL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

// Create axios instance with base configuration - OPTIMIZED for Vercel
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increased to 60 seconds for Vercel cold starts
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Retry logic for timeouts and 5xx errors
    if (config && !config._retry && (
      error.code === 'ECONNABORTED' || 
      error.code === 'ETIMEDOUT' ||
      (error.response && error.response.status >= 500)
    )) {
      config._retry = true;
      config.timeout = 90000; // Even longer timeout for retry
      
      console.log('Retrying API request:', config.url);
      
      // Wait 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api.request(config);
    }
    
    // Log error without sensitive data
    console.error(`API Error: ${error.response?.status || 'Network Error'} - ${error.config?.url || 'Unknown URL'}`);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      
      // Dispatch custom event for auth state change
      window.dispatchEvent(new Event('authChange'));
      
      // Only redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;