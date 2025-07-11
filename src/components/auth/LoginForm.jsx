// src/components/auth/LoginForm.jsx - Complete with Verification Handling
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
  
  const redirectPath = location.state?.from || '/';
  const requiredRole = location.state?.requiredRole;
  const currentRole = location.state?.currentRole;
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      if (!requiredRole || role === requiredRole) {
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
      const response = await api.post('/api/auth/login', formData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      // Handle institution verification requirement
      if (response.data.requiresVerification) {
        setError('Your institution account is pending verification. Please wait for admin approval.');
        setLoading(false);
        return;
      }
      
      // Handle deactivated accounts
      if (response.data.isDeactivated) {
        setError('Your account has been deactivated. Please contact support.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userId', response.data.userId); 
      
      if (requiredRole && response.data.role !== requiredRole) {
        setError(`You need to be logged in as a ${requiredRole} to access that page`);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setLoading(false);
        return;
      }
      
      window.dispatchEvent(new Event('authChange'));
      
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
      if (err.response) {
        if (err.response.status === 403 && err.response.data.requiresVerification) {
          setError('Your institution account is pending verification. Please wait for admin approval.');
        } else if (err.response.status === 403 && err.response.data.isDeactivated) {
          setError('Your account has been deactivated. Please contact support.');
        } else {
          setError(err.response.data?.message || `Error: ${err.response.status}`);
        }
      } else if (err.request) {
        setError('Unable to connect to server. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">Login to Civils HQ</h2>
      
      {requiredRole && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-sm">
          {currentRole ? 
            `You are currently logged in as ${currentRole}. You need to log in as ${requiredRole} to access that page.` :
            `You need to login as ${requiredRole} to continue.`
          }
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
       <div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-2">I am logging in as</label>
  <div className="relative">
    <select
      name="role"
      value={formData.role}
      onChange={handleChange}
      className="appearance-none w-full px-4 py-2.5 pr-8 text-gray-950 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
      style={{WebkitAppearance: 'none', MozAppearance: 'none'}}
    >
      <option value="aspirant">Aspirant</option>
      <option value="institution">Institution</option>
      <option value="admin">Admin</option>
    </select>
    <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  </div>
</div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {formData.role === 'institution' && (
        <div className="mt-4 p-3 bg-yellow-50 rounded text-xs text-yellow-800">
          <p className="font-medium mb-1">📢 Note for Institutions:</p>
          <p>After signup, your account will need to be verified by our admin team before you can access the dashboard. This usually takes 24-48 hours.</p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;