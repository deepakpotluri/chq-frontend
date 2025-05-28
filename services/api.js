// services/api.js - Enhanced API service configuration
import axios from 'axios';

// Get environment variables with fallbacks
const getApiUrl = () => {
  // Check if we're in a browser environment and have access to environment variables
  if (typeof window !== 'undefined') {
    // For production builds, you might want to set this as a build-time variable
    return window.REACT_APP_API_URL || 'http://localhost:5000';
  }
  
  // For development with Create React App
  try {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  } catch (e) {
    return 'http://localhost:5000';
  }
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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls in development
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

// Response interceptor to handle common responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (isDevelopment()) {
      console.log(`API Response ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Dispatch custom event to update UI
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - API might be down');
      error.message = 'Network error. Please check if the backend server is running.';
    }
    
    return Promise.reject(error);
  }
);

export default api;