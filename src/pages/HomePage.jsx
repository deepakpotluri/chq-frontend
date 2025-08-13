// src/pages/HomePage.jsx - Updated with better error handling
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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


  // Cache keys
  const CACHE_KEYS = {
    FEATURED_COURSES: 'homepage_featured_courses',
    PROMOTED_COURSES: 'homepage_promoted_courses',
    CACHE_TIMESTAMP: 'homepage_cache_timestamp'
  };

  // Cache duration: 10 minutes (in milliseconds)
  const CACHE_DURATION = 10 * 60 * 1000;

  // Check if cache is still valid
  const isCacheValid = () => {
    const timestamp = sessionStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
    if (!timestamp) return false;
    
    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    return (now - cacheTime) < CACHE_DURATION;
  };
  
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
  // Tier 1 cities
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',

  // Tier 2 cities
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Kanpur', 'Nagpur',
  'Indore', 'Bhopal', 'Coimbatore', 'Vadodara', 'Ludhiana', 'Visakhapatnam',
  'Patna', 'Thiruvananthapuram', 'Ranchi', 'Raipur', 'Guwahati', 'Chandigarh',

  // Major towns / emerging cities
  'Amritsar', 'Vijayawada', 'Mysore', 'Jodhpur', 'Madurai', 'Jalandhar',
  'Nashik', 'Hubli-Dharwad', 'Rajkot', 'Varanasi', 'Meerut', 'Gwalior',
  'Dhanbad', 'Aurangabad', 'Tiruchirappalli', 'Salem', 'Udaipur', 'Ajmer',
  'Dehradun', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad', 'Howrah',
  'Kochi', 'Jamshedpur', 'Bhilai', 'Bhavnagar', 'Bilaspur', 'Tirupati',
  'Mangalore', 'Siliguri', 'Aligarh', 'Bareilly', 'Moradabad'
];

  const priceRanges = [
    { value: '0-5000', label: 'Under ₹5,000' },
    { value: '5000-15000', label: '₹5,000 - ₹15,000' },
    { value: '15000-30000', label: '₹15,000 - ₹30,000' },
    { value: '30000-50000', label: '₹30,000 - ₹50,000' },
    { value: '50000+', label: 'Above ₹50,000' }
  ];

  useEffect(() => {
  loadCoursesFromCacheOrAPI();
  }, []);

  // Load courses from cache if valid, otherwise fetch from API
  const loadCoursesFromCacheOrAPI = async () => {
    try {
      setLoading(true);
      setError('');

      // Try to load from cache first
      if (isCacheValid()) {
        console.log('Loading courses from cache...');
        
        const cachedFeatured = sessionStorage.getItem(CACHE_KEYS.FEATURED_COURSES);
        const cachedPromoted = sessionStorage.getItem(CACHE_KEYS.PROMOTED_COURSES);
        
        if (cachedFeatured && cachedPromoted) {
          setFeaturedCourses(JSON.parse(cachedFeatured));
          setPromotedCourses(JSON.parse(cachedPromoted));
          setLoading(false);
          return;
        }
      }

      // If cache is invalid or empty, fetch from API
      console.log('Cache invalid or empty, fetching from API...');
      await fetchCoursesFromAPI();
      
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Unable to load courses. Please check your connection and refresh the page.');
      setLoading(false);
    }
  };

  // Fetch courses from API and cache the results
  const fetchCoursesFromAPI = async () => {
    try {
      let fetchedFeatured = [];
      let fetchedPromoted = [];

      // Fetch featured courses
      try {
        const featuredResponse = await api.get('/api/courses/published?isFeatured=true&limit=6');
        
        if (featuredResponse.data.success && featuredResponse.data.data) {
          fetchedFeatured = featuredResponse.data.data;
        }
      } catch (featuredError) {
        console.error('Error fetching featured courses:', featuredError);
      }

      // Fetch promoted courses
      try {
        // First try to get admin-selected homepage courses
        const homepageResponse = await api.get('/api/courses/published?homepage=true');
        
        if (homepageResponse.data.success && homepageResponse.data.data && homepageResponse.data.data.length > 0) {
          fetchedPromoted = homepageResponse.data.data;
        } else {
          // Fallback to regular promoted courses
          const promotedResponse = await api.get('/api/courses/published?promoted=true&limit=4');
          
          if (promotedResponse.data.success && promotedResponse.data.data) {
            fetchedPromoted = promotedResponse.data.data;
          }
        }
      } catch (promotedError) {
        console.error('Error fetching promoted courses:', promotedError);
        // Final fallback to any published courses
        try {
          const fallbackResponse = await api.get('/api/courses/published?limit=4');
          if (fallbackResponse.data.success && fallbackResponse.data.data) {
            fetchedPromoted = fallbackResponse.data.data;
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }

      // If no featured courses, fetch recent published courses
      if (fetchedFeatured.length === 0) {
        try {
          const recentResponse = await api.get('/api/courses/published?limit=6&sort=newest');
          
          if (recentResponse.data.success && recentResponse.data.data) {
            fetchedFeatured = recentResponse.data.data;
          }
        } catch (recentError) {
          console.error('Error fetching recent courses:', recentError);
        }
      }

      // If no promoted courses, fetch all published courses
      if (fetchedPromoted.length === 0) {
        try {
          const allCoursesResponse = await api.get('/api/courses/published?limit=4');
          
          if (allCoursesResponse.data.success && allCoursesResponse.data.data) {
            fetchedPromoted = allCoursesResponse.data.data;
          }
        } catch (allError) {
          console.error('Error fetching all courses:', allError);
        }
      }

      // Update state
      setFeaturedCourses(fetchedFeatured);
      setPromotedCourses(fetchedPromoted);

      // Cache the results
      sessionStorage.setItem(CACHE_KEYS.FEATURED_COURSES, JSON.stringify(fetchedFeatured));
      sessionStorage.setItem(CACHE_KEYS.PROMOTED_COURSES, JSON.stringify(fetchedPromoted));
      sessionStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());

      console.log('Courses fetched and cached successfully');

    } catch (error) {
      console.error('General error fetching courses:', error);
      setError('Unable to load courses. Please check your connection and refresh the page.');
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

  const CourseCard = ({ course, isPromoted = false }) => {
    // Handle missing or invalid course data
    if (!course || !course._id) {
      console.error('Invalid course data:', course);
      return null;
    }

    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${isPromoted ? 'ring-2 ring-yellow-400' : ''}`}>
        {isPromoted && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 text-center">
            PROMOTED
          </div>
        )}
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {course.courseCategory && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                course.courseCategory === 'prelims' ? 'bg-blue-100 text-blue-800' :
                course.courseCategory === 'mains' ? 'bg-green-100 text-green-800' :
                course.courseCategory === 'optionals' ? 'bg-purple-100 text-purple-800' :
                course.courseCategory === 'test-series' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {course.courseCategory.charAt(0).toUpperCase() + course.courseCategory.slice(1)}
              </span>
            )}
            
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

          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 line-clamp-2">
            {course.title || 'Untitled Course'}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.description || 'No description available'}
          </p>

          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-medium ml-1">
                {course.averageRating?.overall?.toFixed(1) || '0.0'}
              </span>
              <span className="text-gray-500 text-sm ml-1">
                ({course.totalReviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                {course.discount > 0 && course.originalPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    ₹{course.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  ₹{(course.price || 0).toLocaleString()}
                </span>
                {course.discount > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    {course.discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {course.city || 'Online'} • {course.duration || 'Flexible'} • 
                {Array.isArray(course.courseLanguages) ? course.courseLanguages.join(', ') : 'English'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {course.institution?.institutionProfile?.institutionName || 
       course.institution?.name || 
       'Institution'}
              </span>
              {course.faculty && course.faculty.length > 0 && course.faculty[0].name && (
                <p className="text-xs mt-1">Faculty: {course.faculty[0].name}</p>
              )}
            </div>
            <Link
              to={`/courses/${course._id}`}
              className="bg-gray-800 hover:bg-gray-900 text-white text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded transition"
            >
              View Details
            </Link>
          </div>

          {course.startDate && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Starts: {new Date(course.startDate).toLocaleDateString()}</span>
                <span>{course.currentEnrollments || 0} enrolled</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Smart Search */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500"> UPSC Course</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8">
              Search from 1000+ courses by top institutes. Compare, review, and enroll in the best courses.
            </p>

            {/* Smart Search Bar */}
            <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-sm rounded-lg p-4 sm:p-2 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center"> 
               {/* City Selector with icon */}
<div className="relative w-full sm:w-auto">
  <Select 
    value={quickFilters.city || "all"} 
    onValueChange={(value) => setQuickFilters({...quickFilters, city: value === "all" ? "" : value})}
  >
    <SelectTrigger className="w-full sm:w-[140px] pl-8 text-gray-950 [&>span]:text-gray-950">
      <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all" className="text-gray-950">All Cities</SelectItem>
      {popularCities.map(city => (
        <SelectItem key={city} value={city} className="text-gray-950">{city}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


<Select 
  value={quickFilters.category || "all"} 
  onValueChange={(value) => setQuickFilters({...quickFilters, category: value === "all" ? "" : value})}
>
  <SelectTrigger className="w-full sm:w-[140px] text-gray-950 [&>span]:text-gray-950">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all" className="text-gray-950">All Categories</SelectItem>
    {courseCategories.map(cat => (
      <SelectItem key={cat.value} value={cat.value} className="text-gray-950">
        {cat.icon} {cat.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
{/* Search Input */}
<div className="flex-1 relative">
  <input 
    type="text"
    placeholder="Search for a course or an institute"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-10 pr-4 py-2.5 text-gray-950 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
  />
  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
</div>

{/* Search Button */}
<button
  type="submit"
  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-md transition-all duration-200 transform hover:scale-105 text-sm shadow-md w-full sm:w-auto"
>
  🔍 Search
</button>
              </div>
            </form>

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
      {/* {!loading && promotedCourses.length > 0 && (
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
      )} */}

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
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-sm sm:text-base flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={fetchCourses} 
                className="ml-4 underline hover:no-underline font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : featuredCourses.length === 0 && promotedCourses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No courses available at the moment.</p>
              <p className="text-sm text-gray-500 mb-6">
                Courses need to be published by institutions to appear here.
              </p>
              <Link 
                to="/courses" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Browse All Courses
              </Link>
            </div>
          ) : featuredCourses.length > 0 ? (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
      {featuredCourses.slice(0, 6).map(course => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
    <div className="text-center mt-8">
      <Link 
        to="/courses" 
        className="inline-flex items-center bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
      >
        Browse All Courses
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  </>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
    {promotedCourses.slice(0, 3).map(course => (
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
            Join thousands of aspirants who have found their perfect course through civilshq.com Compare, review, and enroll today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 sm:px-8 rounded text-base sm:text-lg transition"
            >
              Browse All Courses
            </Link>
            <Link
              to="/signup"
              className="bg-slate-200 text-gray-800 hover:bg-gray-100 font-bold py-3 px-6 sm:px-8 rounded text-base sm:text-lg transition"
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