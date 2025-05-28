// src/components/auth/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'aspirant'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if there's any redirect information in the state (passed from Navbar or protected route)
  const redirectPath = location.state?.from || '/';
  const requiredRole = location.state?.requiredRole;
  const currentRole = location.state?.currentRole;
  
  // Check for any existing auth on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // If user is already logged in and role matches required role, redirect
    if (token && role) {
      if (!requiredRole || role === requiredRole) {
        // Redirect to appropriate dashboard
        if (redirectPath !== '/') {
          navigate(redirectPath);
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'institution') {
          navigate('/institution/dashboard');
        } else {
          navigate('/aspirant/dashboard');
        }
      }
    }
  }, [navigate, redirectPath, requiredRole]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Submitting login with data:', { ...formData, password: '[HIDDEN]' });
      
      const response = await api.post('/api/auth/login', formData);
      console.log('Login response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      // Store the token and role in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      // Check if the user's role matches what's required (if specified)
      if (requiredRole && response.data.role !== requiredRole) {
        setError(`You need to be logged in as a ${requiredRole} to access that page`);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setLoading(false);
        return;
      }
      
      // Dispatch a custom event to trigger UI updates elsewhere (like Navbar)
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect based on the path we came from or role
      if (redirectPath !== '/') {
        navigate(redirectPath);
      } else if (response.data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.role === 'institution') {
        navigate('/institution/dashboard');
      } else {
        navigate('/aspirant/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        setError(err.response.data?.message || `Error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please check if the backend is running.');
      } else {
        setError(`Error: ${err.message}`);
      }
      
      // Clear any partial authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Civils HQ</h2>
      
      {requiredRole && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">
          {currentRole ? 
            `You are currently logged in as ${currentRole}. You need to log in as ${requiredRole} to access that page.` :
            `You need to login as ${requiredRole} to continue.`
          }
        </div>
      )}
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">I am logging in as</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="aspirant">Aspirant</option>
            <option value="institution">Institution</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a 
            href="/signup" 
            className="text-gray-700 font-medium hover:underline"
            onClick={(e) => {
              // Preserve the from and requiredRole params when switching to signup
              if (requiredRole) {
                e.preventDefault();
                navigate('/signup', { 
                  state: { from: redirectPath, requiredRole } 
                });
              }
            }}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
