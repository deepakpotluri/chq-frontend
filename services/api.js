// services/api.js - Fixed API service for Vercel deployment
import axios from 'axios';

// Get base API URL - Fixed for Vercel deployment
const getApiUrl = () => {
  // Check if we're in production (Vercel) or development
  if (typeof window !== 'undefined') {
    // Client-side check
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    } else if (hostname === 'chq-frontend.vercel.app') {
      return 'https://chq-backend.vercel.app';
    } else {
      // For any other production deployment
      return 'https://chq-backend.vercel.app';
    }
  }
  
  // Server-side or fallback
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://chq-backend.vercel.app';
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // Increased timeout for Vercel cold starts
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Important for CORS
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request URL in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.dispatchEvent(new Event('authChange'));

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (!error.response) {
      error.message = 'Network error. Please check your connection and try again.';
    }

    return Promise.reject(error);
  }
);

// Export the API URL for debugging
export const API_URL = getApiUrl();

console.log('API configured for:', API_URL);

export default api;