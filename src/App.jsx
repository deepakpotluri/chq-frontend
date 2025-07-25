// src/App.jsx - Updated with Better Routing and Error Handling
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ViewInstitutionProfile from '../src/pages/ViewInstitutionProfile';

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ element, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) {
    // Redirect to login with information about the required role
    return <Navigate to="/login" state={{ requiredRole: allowedRole, from: window.location.pathname }} replace />;
  }
  
  if (allowedRole && role !== allowedRole) {
    // User is logged in but with wrong role - redirect to login with better information
    return <Navigate to="/login" state={{ 
      requiredRole: allowedRole, 
      currentRole: role, 
      from: window.location.pathname 
    }} replace />;
  }
  
  return element;
};

// 404 Page Component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a href="/" className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition">
          Go to Home
        </a>
      </div>
    </div>
  );
};

const App = () => {
  // Check for authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // You can verify token validity here if needed
      console.log('User is authenticated');
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
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
            <Route path="/about" element={<AboutPage />} />
             <Route path="/institutions/:id" element={<ViewInstitutionProfile />} />
            
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
            
            {/* Profile Settings Route (for any authenticated user) */}
            <Route 
              path="/profile-settings" 
              element={<ProtectedRoute element={<ProfileSettings />} />} 
            />
            
            {/* 404 Route */}
            <Route path="/404" element={<NotFound />} />
            
            {/* Catch all route - redirect to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// About Page Component (placeholder)
const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">About Civils HQ</h1>
      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-4">
          Civils HQ is your one-stop platform for UPSC Civil Services preparation. 
          We connect aspirants with the best coaching institutes across India.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-gray-600">
              To make quality UPSC preparation accessible to every aspirant across India.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-gray-600">
              To be the most trusted platform for civil services preparation in India.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Our Values</h3>
            <p className="text-gray-600">
              Transparency, Quality, and Student Success drive everything we do.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component (placeholder)
const ProfileSettings = () => {
  const role = localStorage.getItem('role');
  
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Profile settings page for {role} users - Coming soon!</p>
        <div className="mt-8">
          <a href={`/${role}/dashboard`} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;