// src/components/auth/SignupForm.jsx (Updated)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'aspirant',
    institutionName: '',
    institutionType: '',
    adminCode: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if there's any redirect information in the state (passed from Navbar or login page)
  const redirectPath = location.state?.from || '/';
  const requiredRole = location.state?.requiredRole;
  
  // If a specific role is required, set it as the default
  useEffect(() => {
    if (requiredRole) {
      setFormData(prev => ({ ...prev, role: requiredRole }));
    }
  }, [requiredRole]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/auth/signup', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      // If a required role was specified and doesn't match the signed-up role, show error
      if (requiredRole && response.data.role !== requiredRole) {
        setError(`You need to be registered as a ${requiredRole} to access that page`);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setLoading(false);
        return;
      }
      
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
      console.error('Signup error:', err);
      if (err.response) {
        setError(err.response.data?.message || `Error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please check if the backend is running.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign up for Civils HQ</h2>
      
      {requiredRole && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">
          You need to register as a {requiredRole} to continue
        </div>
      )}
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">I am registering as</label>
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
        
        {/* Rest of the form remains the same */}
        {formData.role === 'aspirant' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>
        )}
        
        {formData.role === 'institution' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Institution Name</label>
              <input
                type="text"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Institution Type</label>
              <select
                name="institutionType"
                value={formData.institutionType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              >
                <option value="">Select Type</option>
                <option value="coaching">Coaching Institute</option>
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Contact Person Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
          </>
        )}
        
        {formData.role === 'admin' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Admin Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Admin Code</label>
              <input
                type="text"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
          </>
        )}
        
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
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a 
            href="/login" 
            className="text-gray-700 font-medium hover:underline"
            onClick={(e) => {
              // Preserve the from and requiredRole params when switching to login
              if (requiredRole) {
                e.preventDefault();
                navigate('/login', { 
                  state: { from: redirectPath, requiredRole } 
                });
              }
            }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;