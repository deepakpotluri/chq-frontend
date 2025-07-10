// src/components/Navbar.jsx - Updated with React Router Link components
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [peopleMenuOpen, setPeopleMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (token) {
        setIsLoggedIn(true);
        setUserRole(role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuthStatus();
    window.addEventListener('authChange', checkAuthStatus);
    
    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login');
    setPeopleMenuOpen(false);
    setMobileMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
  };

  const togglePeopleMenu = () => {
    setPeopleMenuOpen(!peopleMenuOpen);
  };

  const closePeopleMenu = () => {
    setPeopleMenuOpen(false);
  };

  const handleDashboardClick = (requiredRole, path) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role === requiredRole) {
      navigate(path);
    } else if (token && role !== requiredRole) {
      navigate('/login', {
        state: {
          from: path,
          requiredRole: requiredRole,
          currentRole: role
        }
      });
    } else {
      navigate('/login', {
        state: {
          from: path,
          requiredRole: requiredRole
        }
      });
    }
    
    setPeopleMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50 border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              className="text-lg sm:text-xl font-bold text-gray-700 transition-all duration-300 hover:text-gray-900 cursor-pointer transform hover:scale-105"
            >
              Civils HQ
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-100">
              Home
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-100">
              About
            </Link>
            
            {/* People dropdown */}
            <div className="relative">
              {/* <button 
                onClick={togglePeopleMenu}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-100 flex items-center"
              >
                <span>People</span>
                <svg 
                  className={`w-4 h-4 ml-1 transition-transform ${peopleMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button> */}
              
              {/* {peopleMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                  <button 
                    onClick={() => handleDashboardClick('admin', '/admin/dashboard')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Admin Dashboard
                  </button>
                  
                  <button 
                    onClick={() => handleDashboardClick('institution', '/institution/dashboard')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Institution Dashboard
                  </button>
                  
                  <button 
                    onClick={() => handleDashboardClick('aspirant', '/aspirant/dashboard')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Aspirant Dashboard
                  </button>
                </div>
              )} */}
            </div>
            
            {/* Profile/Login section */}
            {isLoggedIn ? (
              <ProfileDropdown onLogout={handleLogout} />
            ) : (
              <Link to="/login" className="ml-4 inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105">
                Login/Signup
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            {isLoggedIn && (
              <div className="mr-2">
                <ProfileDropdown onLogout={handleLogout} />
              </div>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-inner bg-gray-50">
          <Link to="/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-all duration-200">
            Home
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-all duration-200">
            About
          </Link>
          
          {/* Dashboard options for mobile */}
          {/* <div className="px-3 py-2 rounded-md text-base font-medium border-t border-gray-200 mt-2 pt-2">
            <h3 className="text-gray-500 text-sm uppercase font-bold mb-2">People</h3>
            
            <button 
              onClick={() => handleDashboardClick('admin', '/admin/dashboard')}
              className="block w-full text-left py-2 text-base text-gray-700"
            >
              Admin Dashboard
            </button>
            
            <button 
              onClick={() => handleDashboardClick('institution', '/institution/dashboard')}
              className="block w-full text-left py-2 text-base text-gray-700"
            >
              Institution Dashboard
            </button>
            
            <button 
              onClick={() => handleDashboardClick('aspirant', '/aspirant/dashboard')}
              className="block w-full text-left py-2 text-base text-gray-700"
            >
              Aspirant Dashboard
            </button>
          </div> */}
          
          {/* Login/Signup button for mobile */}
          {!isLoggedIn && (
            <div className="px-3 py-2 mt-2">
              <Link 
                to="/login"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Login/Signup
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay to close menu when clicking outside */}
      {peopleMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={closePeopleMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;