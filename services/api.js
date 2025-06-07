// services/api.js - Fixed API service for Vercel deployment
import axios from 'axios';

// Get base API URL - Fixed for Vercel deployment
const getApiUrl = () => {
  // Default URLs - no trailing slash
  const productionUrl = 'https://chq-backend.vercel.app';
  const developmentUrl = 'http://localhost:5000';
  
  // Check if running in browser
  if (typeof window !== 'undefined') {
    // In development (localhost)
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return developmentUrl;
    }
  }
  
  // In production or default
  return productionUrl;
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // Increased timeout for Vercel cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (window.location.hostname === 'localhost') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (window.location.hostname === 'localhost') {
      console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    
    return response;
  },
  (error) => {
    // Log errors
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.dispatchEvent(new Event('authChange'));

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection and try again.';
    }

    // Handle 500 errors
    if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      error.message = error.response.data?.message || 'You do not have permission to perform this action.';
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      error.message = error.response.data?.message || 'The requested resource was not found.';
    }

    return Promise.reject(error);
  }
);

// Helper function to get the current API URL (useful for debugging)
api.getBaseURL = () => api.defaults.baseURL;

// Helper function to check if API is reachable
api.checkConnection = async () => {
  try {
    const response = await api.get('/');
    return { 
      connected: true, 
      message: response.data?.message || 'Connected',
      baseURL: api.defaults.baseURL 
    };
  } catch (error) {
    return { 
      connected: false, 
      message: error.message,
      baseURL: api.defaults.baseURL,
      error: error.response?.data || error.message
    };
  }
};

export default api;