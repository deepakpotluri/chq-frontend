// src/services/api.js
import axios from 'axios';

// Safely access environment variables with fallbacks
const getApiUrl = () => {
  // Try to get from environment variable first
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback based on hostname
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Production fallback
  return 'https://chq-backend.vercel.app';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Log the API URL being used (for debugging)
console.log('API Base URL:', api.defaults.baseURL);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the full request URL for debugging
    const fullUrl = config.baseURL + config.url;
    console.log('API Request:', config.method.toUpperCase(), fullUrl);
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log detailed error information
    if (error.response) {
      // Server responded with error
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // Request made but no response
      console.error('API No Response:', error.request);
    } else {
      // Error in request setup
      console.error('API Request Setup Error:', error.message);
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;