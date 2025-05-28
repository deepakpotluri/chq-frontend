// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api'; // Updated to use API service

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        
        const response = await api.get('/api/admin/stats');
        
        setStats(response.data);
      } catch (err) {
        setError('Failed to load admin data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);
  
  // Check authentication
  if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 pt-20 pb-10">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        {stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-lg mb-2">Total Aspirants</h3>
                <p className="text-2xl font-bold">{stats.aspirantCount}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-medium text-lg mb-2">Total Institutions</h3>
                <p className="text-2xl font-bold">{stats.institutionCount}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-lg mb-2">Total Courses</h3>
                <p className="text-2xl font-bold">{stats.courseCount}</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-lg mb-2">Manage Users</h3>
                  <p className="text-gray-600">View and manage all users</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-lg mb-2">Institution Approval</h3>
                  <p className="text-gray-600">Approve or reject institution registrations</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-lg mb-2">System Settings</h3>
                  <p className="text-gray-600">Configure system parameters</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
          }}
          className="mt-6 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;