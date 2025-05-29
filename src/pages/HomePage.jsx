// src/pages/HomePage.jsx - Improved responsive version
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [promotedCourses, setPromotedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilters, setQuickFilters] = useState({
    category: '',
    mode: '',
    city: '',
    priceRange: ''
  });
  
  const navigate = (path) => {
    window.location.href = path;
  };

  const courseCategories = [
    { value: 'prelims', label: 'Prelims', icon: '📚' },
    { value: 'mains', label: 'Mains', icon: '✍️' },
    { value: 'prelims-cum-mains', label: 'Prelims + Mains', icon: '🎯' },
    { value: 'optionals', label: 'Optionals', icon: '📖' },
    { value: 'test-series', label: 'Test Series', icon: '📝' },
    { value: 'interview', label: 'Interview', icon: '🎤' }
  ];

  const courseModes = [
    { value: 'online', label: 'Online', icon: '💻' },
    { value: 'offline', label: 'Offline', icon: '🏫' },
    { value: 'hybrid', label: 'Hybrid', icon: '🔄' }
  ];

  const popularCities = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

  const priceRanges = [
    { value: '0-5000', label: 'Under ₹5,000' },
    { value: '5000-15000', label: '₹5,000 - ₹15,000' },
    { value: '15000-30000', label: '₹15,000 - ₹30,000' },
    { value: '30000-50000', label: '₹30,000 - ₹50,000' },
    { value: '50000+', label: 'Above ₹50,000' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Fetch featured courses
      const featuredResponse = await api.get('/api/courses/published?isFeatured=true&limit=6');
      if (featuredResponse.data.success) {
        setFeaturedCourses(featuredResponse.data.data || []);
      }

      // Fetch promoted courses
      const promotedResponse = await api.get('/api/courses/published?promoted=true&limit=8');
      if (promotedResponse.data.success) {
        setPromotedCourses(promotedResponse.data.data || []);
      }

      // If no featured courses, fetch recent published courses
      if ((featuredResponse.data.data || []).length === 0) {
        const recentResponse = await api.get('/api/courses/published?limit=6&sort=newest');
        if (recentResponse.data.success) {
          setFeaturedCourses(recentResponse.data.data || []);
        }
      }

      // If no promoted courses, fetch some published courses
      if ((promotedResponse.data.data || []).length === 0) {
        const allCoursesResponse = await api.get('/api/courses/published?limit=4');
        if (allCoursesResponse.data.success) {
          setPromotedCourses(allCoursesResponse.data.data || []);
        }
      }
    } catch (error) {
      setError('Unable to load courses. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    
    if (searchQuery) searchParams.append('search', searchQuery);
    if (quickFilters.category) searchParams.append('category', quickFilters.category);
    if (quickFilters.mode) searchParams.append('type', quickFilters.mode);
    if (quickFilters.city) searchParams.append('city', quickFilters.city);
    if (quickFilters.priceRange) searchParams.append('priceRange', quickFilters.priceRange);
    
    navigate(`/courses?${searchParams.toString()}`);
  };

  const handleQuickCategorySearch = (category) => {
    navigate(`/courses?category=${category}`);
  };

  const CourseCard = ({ course, isPromoted = false }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${isPromoted ? 'ring-2 ring-yellow-400' : ''}`}>
      {isPromoted && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 text-center">
          PROMOTED
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            course.courseCategory === 'prelims' ? 'bg-blue-100 text-blue-800' :
            course.courseCategory === 'mains' ? 'bg-green-100 text-green-800' :
            course.courseCategory === 'optionals' ? 'bg-purple-100 text-purple-800' :
            course.courseCategory === 'test-series' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {course.courseCategory?.charAt(0).toUpperCase() + course.courseCategory?.slice(1)}
          </span>
          
          {Array.isArray(course.courseType) && course.courseType.map((type, idx) => (
            <span key={idx} className={`px-2 py-1 text-xs rounded-full ${
              type === 'online' ? 'bg-blue-50 text-blue-700' :
              type === 'offline' ? 'bg-green-50 text-green-700' :
              'bg-purple-50 text-purple-700'
            }`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>

        <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-medium ml-1">{course.averageRating?.overall?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-500 text-sm ml-1">({course.totalReviews || 0} reviews)</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              {course.discount > 0 && (
                <span className="text-gray-400 line-through text-sm">₹{course.originalPrice?.toLocaleString()}</span>
              )}
              <span className="text-base sm:text-lg font-bold text-gray-900">₹{course.price?.toLocaleString()}</span>
              {course.discount > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  {course.discount}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {course.city} • {course.duration} • {course.courseLanguages?.join(', ') || course.language?.join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{course.institution?.institutionName}</span>
            {course.faculty && course.faculty.length > 0 && (
              <p className="text-xs mt-1">by {course.faculty[0].name}</p>
            )}
          </div>
          <Link
            to={`/courses/${course._id}`}
            className="bg-gray-800 hover:bg-gray-900 text-white text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded transition"
          >
            View Details
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Starts: {new Date(course.startDate).toLocaleDateString()}</span>
            <span>{course.currentEnrollments} enrolled</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Smart Search */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> UPSC Course</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8">
              Search from 1000+ courses by top institutes. Compare, review, and enroll in the best UPSC preparation courses.
            </p>

            {/* Smart Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-lg p-2 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Search courses, institutes, cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                
                <select
                  value={quickFilters.category}
                  onChange={(e) => setQuickFilters({...quickFilters, category: e.target.value})}
                  className="px-3 sm:px-4 py-2 sm:py-3 text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">All Categories</option>
                  {courseCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                <select
                  value={quickFilters.mode}
                  onChange={(e) => setQuickFilters({...quickFilters, mode: e.target.value})}
                  className="px-3 sm:px-4 py-2 sm:py-3 text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">All Modes</option>
                  {courseModes.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded transition flex items-center justify-center text-sm sm:text-base"
                >
                  🔍 Search
                </button>
              </div>
            </form>

            {/* Advanced Filters */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <select
                value={quickFilters.city}
                onChange={(e) => setQuickFilters({...quickFilters, city: e.target.value})}
                className="px-3 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select City</option>
                {popularCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={quickFilters.priceRange}
                onChange={(e) => setQuickFilters({...quickFilters, priceRange: e.target.value})}
                className="px-3 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Price Range</option>
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Categories */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {courseCategories.map(category => (
              <button
                key={category.value}
                onClick={() => handleQuickCategorySearch(category.value)}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 text-center group"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 text-sm sm:text-base">
                  {category.label}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Promoted Courses Carousel */}
      {promotedCourses.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">🔥 Promoted Courses</h2>
              <Link to="/courses?promoted=true" className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base">
                View All →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {promotedCourses.slice(0, 4).map(course => (
                <CourseCard key={course._id} course={course} isPromoted={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">⭐ Featured Courses</h2>
            <Link to="/courses?featured=true" className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base">
              View All Featured →
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured courses available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {featuredCourses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">Why Choose CivilsHQ?</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🔍</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Smart Search</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Find courses by name, institute, city, faculty, or subject with our advanced search engine.
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">⭐</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Verified Reviews</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Read authentic reviews from verified students who have actually enrolled in courses.
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Best Prices</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Compare prices across institutes and find the best deals with our price comparison tool.
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">📚</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Comprehensive Info</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Get detailed information about syllabus, faculty, schedule, and more before enrolling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Start Your UPSC Journey?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-gray-300">
            Join thousands of aspirants who have found their perfect course through CivilsHQ. Compare, review, and enroll today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 sm:px-8 rounded text-base sm:text-lg transition"
            >
              Browse All Courses
            </Link>
            <Link
              to="/signup"
              className="bg-white text-gray-800 hover:bg-gray-100 font-bold py-3 px-6 sm:px-8 rounded text-base sm:text-lg transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;