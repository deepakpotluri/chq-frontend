// services/api.js - Fixed API service for Vercel deployment
import axios from 'axios';

// Get base API URL - Fixed for Vercel deployment
const getApiUrl = () => {
  // For production (Vercel), ensure no trailing slash
  const productionUrl = 'https://chq-backend.vercel.app';
  const developmentUrl = 'http://localhost:5000';
  
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' 
      ? developmentUrl 
      : productionUrl;
  }
  
  return process.env.NODE_ENV === 'development' 
    ? developmentUrl 
    : productionUrl;
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

export default api;