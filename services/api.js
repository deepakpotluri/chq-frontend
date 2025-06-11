// services/api.js
import axios from 'axios';

// Get API URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
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
    
    // Log request details in development mode
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} request to: ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common response scenarios
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development mode
    if (import.meta.env.DEV) {
      console.log(`✅ Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Dispatch custom event for auth state change
      window.dispatchEvent(new Event('authChange'));
      
      // Only redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Log errors in development mode
    if (import.meta.env.DEV) {
      console.error(`❌ API Error:`, {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check API health
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    return null;
  }
};

// Log API configuration on initialization
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: API_URL,
    environment: import.meta.env.MODE,
  });
}

export default api;