import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoClick = (e) => {
    e.preventDefault(); // Prevent default Link behavior
    window.location.href = '/'; // Force page refresh and redirect to home
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-900 shadow-xl w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center space-x-2"
            aria-label="Homepage"
          >
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-200 to-teal-200 bg-clip-text text-transparent hover:from-teal-300 hover:to-blue-300 transition-all duration-500">
              visafreetraveler.com
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <NavLink to="/about" label="About" />
            <NavLink to="/contact" label="Contact" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Toggle navigation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} pb-4`}>
          <div className="px-2 pt-2 space-y-2 bg-white rounded-lg shadow-lg">
            <MobileNavLink
              to="/about"
              label="About"
              onClick={() => setIsOpen(false)}
            />
            <MobileNavLink
              to="/contact"
              label="Contact"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Reusable NavLink component for desktop
const NavLink = ({ to, label }) => (
  <Link
    to={to}
    className="relative text-gray-200 hover:text-white font-medium group transition-colors duration-300"
    aria-label={`${label} page`}
  >
    {label}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all group-hover:w-full"></span>
  </Link>
);

// Mobile-specific NavLink component
const MobileNavLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-3 text-gray-800 hover:bg-blue-50 rounded-md transition-colors duration-200 font-medium"
    aria-label={`${label} page`}
  >
    {label}
  </Link>
);

export default Navbar;