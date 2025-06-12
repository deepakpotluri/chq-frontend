// services/api.js
import axios from 'axios';

// Get API URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Ensure the URL doesn't have a trailing slash
const baseURL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

// Log configuration for debugging
console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_URL: API_URL,
  baseURL: baseURL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

// Create axios instance with base configuration
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for Vercel cold starts
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
      console.log('Full URL:', `${config.baseURL}${config.url}`);
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
    // Log the full error details
    console.error(`❌ API Error:`, {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
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
    
    return Promise.reject(error);
  }
);

// Helper function to check API health
export const checkAPIHealth = async () => {
  try {
    console.log('Checking API health at:', `${baseURL}/`);
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    return null;
  }
};

// Test the API URL immediately
if (typeof window !== 'undefined') {
  checkAPIHealth().then(result => {
    if (result) {
      console.log('✅ API is reachable:', result);
    } else {
      console.error('❌ API is not reachable');
    }
  });
}

export default api;