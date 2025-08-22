// src/pages/GoogleFormPage.jsx - Complete version with URL fix
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleFormPage = () => {
  const iframeRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Force URL update in browser address bar
    if (window.location.pathname !== '/contact-form') {
      window.history.pushState(null, '', '/contact-form');
    }
    
    // Update document title
    document.title = 'Contact Form - Civils HQ';
    
    // Ensure the page starts at the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const handleMessage = (event) => {
      // Check if the message is from Google Forms
      if (event.origin !== 'https://docs.google.com') return;
      
      // Listen for form navigation events
      if (event.data && (
        event.data.includes('formResponse') || 
        event.data.includes('continue') || 
        event.data.includes('next') ||
        event.data.includes('submit') ||
        (typeof event.data === 'object' && (
          event.data.type === 'resize' || 
          event.data.type === 'scroll' ||
          event.data.action === 'next'
        ))
      )) {
        // Scroll to top of the page smoothly
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
    };

    // Add event listener for messages from iframe
    window.addEventListener('message', handleMessage);

    // Handle browser back/forward buttons
    const handlePopState = (event) => {
      if (window.location.pathname === '/contact-form') {
        // We're still on the contact form page, no need to navigate
        event.preventDefault();
      }
    };
    
    window.addEventListener('popstate', handlePopState);

    // Show scroll to top button when user scrolls down
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location, navigate]);

  // Handle iframe load to ensure proper URL state
  const handleIframeLoad = () => {
    // Double-check URL is correct after iframe loads
    if (window.location.pathname !== '/contact-form') {
      window.history.replaceState(null, '', '/contact-form');
    }
    
    // Scroll to top after a brief delay to ensure iframe is fully loaded
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
            <p className="text-gray-600 mt-1">Get in touch with our team</p>
          </div>
          
          {/* Form Iframe */}
          <div className="w-full">
            <iframe 
              ref={iframeRef}
              src="https://docs.google.com/forms/d/e/1FAIpQLSfI9yw01hgyYf3y-2qPrPMtw4wil_16GCSom2gX9tgGFshAYw/viewform" 
              width="100%" 
              height="3500" 
              frameBorder="0" 
              marginHeight="0" 
              marginWidth="0"
              title="Contact Form"
              className="w-full"
              onLoad={handleIframeLoad}
              style={{
                border: 'none',
                overflow: 'hidden'
              }}
            >
              Loading form...
            </iframe>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default GoogleFormPage;