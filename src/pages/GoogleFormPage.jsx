// src/pages/GoogleFormPage.jsx - Clean version without hardcoded information
import React, { useEffect, useRef, useState } from 'react';

const GoogleFormPage = () => {
  const iframeRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
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
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
              title="Form"
              className="w-full"
              onLoad={() => {
                // Ensure we start at the top
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 500);
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