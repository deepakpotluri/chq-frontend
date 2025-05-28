// services/api.js - Enhanced API service configuration
import axios from 'axios';

// Get base API URL
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Try window environment variable first (useful for frontend-only apps)
    return (
      window.REACT_APP_API_URL || // Optional override
      (window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://chq-backend.vercel.app/')
    );
  }

  // Fallback to Node environment variable or reasonable defaults
  return (
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://chq-backend.vercel.app/')
  );
};

const isDevelopment = () => {
  try {
    return process.env.NODE_ENV === 'development';
  } catch (e) {
    return window.location.hostname === 'localhost';
  }
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
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

    if (isDevelopment()) {
      console.log(`API ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (isDevelopment()) {
      console.log(`API Response ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.dispatchEvent(new Event('authChange'));

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (!error.response) {
      error.message = 'Network error. Please check if the backend server is running.';
    }

    return Promise.reject(error);
  }
);

export default api;
