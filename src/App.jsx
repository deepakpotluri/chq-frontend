// src/App.jsx - Updated with Better URL Syncing and Cache Busting
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import HomePage from '../src/pages/HomePage';
// import NotFound from '../src/pages/NotFound';  // Create this file or remove if not needed
// import ProfileSettings from '../src/pages/ProfileSettings';  // Create this file or remove if not needed

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

// Google Form Page
import GoogleFormPage from '../src/pages/GoogleFormPage';

// ScrollToTop Component with URL Sync
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force browser URL update
    if (window.location.pathname !== pathname) {
      window.history.replaceState(null, '', pathname);
    }
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Clear any cached navigation state
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.active) {
            registration.active.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }
  }, [pathname]);

  return null;
};

// URL Sync Component - ensures browser URL stays in sync
const URLSync = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Force URL synchronization on location change
    const currentPath = window.location.pathname;
    if (currentPath !== location.pathname) {
      window.history.replaceState(null, '', location.pathname + location.search + location.hash);
    }
    
    // Disable caching for navigation
    if (window.performance && window.performance.navigation) {
      if (window.performance.navigation.type === 2) {
        // Page was accessed by navigating into the history
        window.location.reload();
      }
    }
  }, [location]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ element, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) {
    return <Navigate to="/login" state={{ requiredRole: allowedRole, from: window.location.pathname }} replace />;
  }
  
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" state={{ 
      requiredRole: allowedRole, 
      from: window.location.pathname,
      message: `Access denied. ${allowedRole} role required.` 
    }} replace />;
  }
  
  return element;
};

// About Page Component
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

const App = () => {
  useEffect(() => {
    // Disable back-forward cache
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });

    // Clear cache on app start
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('runtime') || name.includes('precache')) {
            caches.delete(name);
          }
        });
      });
    }

    return () => {
      window.removeEventListener('pageshow', () => {});
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <URLSync />
        <ScrollToTop />
        <Navbar />
        <div className="pt-16"> {/* Account for fixed navbar */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route 
              path="/course/:id" 
              element={<CourseDetailPage />} 
            />
            <Route 
              path="/institution/:id" 
              element={<ViewInstitutionProfile />} 
            />
            
            {/* Contact Form Route with proper URL handling */}
            <Route path="/contact-form" element={<GoogleFormPage />} />
            
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
            
            {/* 404 Route - Create NotFound component or use a simple div */}
            {/* <Route path="/404" element={<NotFound />} /> */}
            <Route path="/404" element={<div className="flex items-center justify-center h-96"><h1 className="text-2xl">404 - Page Not Found</h1></div>} />
            
            {/* Profile Settings Route - Create ProfileSettings component or remove */}
            {/* <Route 
              path="/profile-settings" 
              element={<ProtectedRoute element={<ProfileSettings />} />} 
            /> */}
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;