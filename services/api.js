// src/services/api.js
import axios from 'axios';

// Simple API URL configuration
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://chq-backend.vercel.app';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    return Promise.reject(error);
  }
);

export default api;