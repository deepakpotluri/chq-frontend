import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    city: '',
    language: '',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    rating: '',
    promoted: false,
    featured: false
  });
  
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 12
  });

  // Filter options
  const courseCategories = [
    { value: '', label: 'All Categories' },
    { value: 'prelims', label: 'Prelims' },
    { value: 'mains', label: 'Mains' },
    { value: 'prelims-cum-mains', label: 'Prelims + Mains' },
    { value: 'optionals', label: 'Optionals' },
    { value: 'test-series', label: 'Test Series' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'interview', label: 'Interview Guidance' }
  ];

  const courseTypes = [
    { value: '', label: 'All Modes' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'weekend', label: 'Weekend Batches' },
    { value: 'evening', label: 'Evening Batches' }
  ];

  const languages = [
    { value: '', label: 'All Languages' },
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'gujarati', label: 'Gujarati' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'start-date', label: 'Start Date' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  // Popular cities - same as HomePage
  const popularCities = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

  useEffect(() => {
    fetchCourses();
  }, [filters, sortBy, pagination.currentPage]);

  useEffect(() => {
    // Parse URL parameters on component mount
    const urlParams = new URLSearchParams(window.location.search);
    const newFilters = { ...filters };
    
    ['search', 'category', 'type', 'city', 'language', 'minPrice', 'maxPrice', 'startDate', 'rating'].forEach(param => {
      if (urlParams.get(param)) {
        newFilters[param] = urlParams.get(param);
      }
    });
    
    if (urlParams.get('promoted') === 'true') newFilters.promoted = true;
    if (urlParams.get('featured') === 'true') newFilters.featured = true;
    
    setFilters(newFilters);
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.currentPage);
      params.append('limit', pagination.limit);
      params.append('sort', sortBy);
      
      // Add all active filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/api/courses/published?${params}`);
      
      if (response.data.success) {
        setCourses(response.data.courses || response.data.data || []);
        setPagination({
          ...pagination,
          totalPages: response.data.totalPages || 1
        });
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      city: '',
      language: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      rating: '',
      promoted: false,
      featured: false
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination({ ...pagination, currentPage: page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const CourseCard = ({ course, isListView }) => (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${isListView ? 'flex' : ''}`}>
      {/* Image Section */}
      <div className={`relative ${isListView ? 'w-48 h-48' : 'h-48 sm:h-56'} bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center`}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl sm:text-4xl">📚</span>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {course.isPromoted && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Promoted</span>
          )}
          {course.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">Featured</span>
          )}
        </div>
        
        {/* Discount */}
        {course.discount > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {course.discount}% OFF
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1">
        {/* Category and Type Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            course.courseCategory === 'prelims' ? 'bg-blue-100 text-blue-800' :
            course.courseCategory === 'mains' ? 'bg-green-100 text-green-800' :
            course.courseCategory === 'prelims-cum-mains' ? 'bg-purple-100 text-purple-800' :
            course.courseCategory === 'optionals' ? 'bg-indigo-100 text-indigo-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {course.courseCategory?.charAt(0).toUpperCase() + course.courseCategory?.slice(1).replace('-', ' ')}
          </span>
          
          {course.courseType?.map((type, idx) => (
            <span key={idx} className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{course.title}</h3>
        
        {/* Institution Name */}
        <p className="text-sm text-gray-600 mb-3">
          {course.institution?.institutionName || 'Institution'}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">⭐</span>
            <span className="font-medium text-sm">{course.averageRating?.overall?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-500 text-sm ml-1">({course.totalReviews || 0} reviews)</span>
          </div>
        </div>

        {/* Views and Enrollments */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span>👁️ {course.views || 0} views</span>
          <span>👥 {course.currentEnrollments || 0} enrolled</span>
        </div>

        {/* Faculty */}
        {course.faculty && (
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Faculty:</span> {
              typeof course.faculty === 'string' 
                ? course.faculty 
                : Array.isArray(course.faculty) 
                  ? course.faculty.map(f => f.name || f).join(', ')
                  : course.faculty.name || 'Faculty'
            }
          </p>
        )}

        {/* Price Section */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div>
              {course.discount > 0 && (
                <span className="text-gray-400 line-through text-sm mr-2">
                  ₹{course.originalPrice?.toLocaleString()}
                </span>
              )}
              <span className="text-xl font-bold text-gray-900">
                ₹{course.price?.toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Location, Duration, Language */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 flex-wrap">
            <span>📍 {course.city}</span>
            <span>•</span>
            <span>⏱️ {course.duration}</span>
            <span>•</span>
            <span>🗣️ {course.courseLanguages?.join(', ')}</span>
          </div>
          
          {/* Start Date */}
          <p className="text-xs text-gray-600 mt-2">
            Starts: {new Date(course.startDate).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <button className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-2">
            ❤️
          </button>
          <a
            href={`/courses/${course._id}`}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Browse UPSC Courses</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Find the perfect course for your UPSC preparation from top institutes across India
        </p>
      </div>

      {/* Search and Quick Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="Search courses, institutes, cities, subjects..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base appearance-none bg-white"
            >
              {courseCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base appearance-none bg-white"
            >
              {courseTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* City Dropdown - matching HomePage style */}
          <div className="relative w-full">
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 text-gray-950 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white w-full"
            >
              <option value="">All Cities</option>
              {popularCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          <div className="relative">
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-3 py-2.5 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full px-3 py-2.5 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-3 mt-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.promoted}
              onChange={(e) => handleFilterChange('promoted', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Promoted Only</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Featured Only</span>
          </label>

          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium ml-auto"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Results Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="text-gray-700">
          <span className="font-semibold text-lg">{courses?.length || 0}</span> courses found
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error && (!courses || courses.length === 0) ? (
        <div className="bg-red-100 text-red-700 p-6 rounded-lg text-center">
          {error}
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-700 mb-3">No courses found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition duration-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8' 
          : 'space-y-4 sm:space-y-6'
        }>
          {courses.map(course => (
            <CourseCard key={course._id} course={course} isListView={viewMode === 'list'} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && courses && courses.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8 sm:mt-12">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 sm:px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-sm sm:text-base"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                  pageNum === pagination.currentPage
                    ? 'bg-gray-800 text-white'
                    : 'border hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {pagination.totalPages > 5 && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                  pagination.totalPages === pagination.currentPage
                    ? 'bg-gray-800 text-white'
                    : 'border hover:bg-gray-100'
                }`}
              >
                {pagination.totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 sm:px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-sm sm:text-base"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;