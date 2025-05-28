// src/App.jsx (Updated with Course Detail Page route)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import HomePage from '../src/pages/HomePage';

// Auth Components
import LoginForm from '../src/components/auth/LoginForm';
import SignupForm from '../src/components/auth/SignupForm';

// Dashboard Pages
import AspirantDashboard from '../src/pages/AspirantDashboard';
import InstitutionDashboard from '../src/pages/InstitutionDashboard';
import AdminDashboard from '../src/pages/AdminDashboard';

// Course Pages
import CoursesPage from '../src/pages/CoursePage';
import CourseDetailPage from '../src/pages/CourseDetailPage';

// Protected Route Component
const ProtectedRoute = ({ element, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) {
    // Redirect to login with information about the required role
    return <Navigate to="/login" state={{ requiredRole: allowedRole, from: window.location.pathname }} />;
  }
  
  if (allowedRole && role !== allowedRole) {
    // User is logged in but with wrong role - redirect to login with better information
    return <Navigate to="/login" state={{ 
      requiredRole: allowedRole, 
      currentRole: role, 
      from: window.location.pathname 
    }} />;
  }
  
  return element;
};

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        {/* Added pt-16 class to create space for the fixed navbar */}
        <div className="content pt-16 min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/aspirant/dashboard" 
              element={<ProtectedRoute element={<AspirantDashboard />} allowedRole="aspirant" />} 
            />
            <Route 
              path="/institution/dashboard" 
              element={<ProtectedRoute element={<InstitutionDashboard />} allowedRole="institution" />}
            />
            <Route 
              path="/admin/dashboard" 
              element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />} 
            />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;