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
    state: '',
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

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  useEffect(() => {
    fetchCourses();
  }, [filters, sortBy, pagination.currentPage]);

  useEffect(() => {
    // Parse URL parameters on component mount
    const urlParams = new URLSearchParams(window.location.search);
    const newFilters = { ...filters };
    
    ['search', 'category', 'type', 'city', 'state', 'language', 'minPrice', 'maxPrice', 'startDate', 'rating'].forEach(param => {
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
      
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      if (sortBy !== 'relevance') {
        params.append('sort', sortBy);
      }

      const response = await api.get(`/api/courses/published?${params.toString()}`);
      
      setCourses(response.data.data);
      setPagination({
        ...pagination,
        totalPages: response.data.pagination.pages
      });
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      city: '',
      state: '',
      language: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      rating: '',
      promoted: false,
      featured: false
    });
    setSortBy('relevance');
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setPagination({
      ...pagination,
      currentPage: newPage
    });
    
    window.scrollTo(0, 0);
  };

  const CourseCard = ({ course, isListView = false }) => (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-xl transition-all duration-300 ${isListView ? 'flex' : ''}`}>
      {course.promotionLevel !== 'none' && (
        <div className={`bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 ${isListView ? 'writing-mode-vertical' : 'text-center'}`}>
          {course.promotionLevel === 'premium' ? 'PREMIUM' : 'PROMOTED'}
        </div>
      )}
      
      <div className={`p-6 ${isListView ? 'flex-1' : ''}`}>
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

          {course.isFeatured && (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
              ⭐ FEATURED
            </span>
          )}
        </div>

        <h3 className={`font-bold mb-2 line-clamp-2 ${isListView ? 'text-xl' : 'text-lg'}`}>
          {course.title}
        </h3>
        <p className={`text-gray-600 mb-3 ${isListView ? 'line-clamp-3' : 'line-clamp-2 text-sm'}`}>
          {course.description}
        </p>

        {/* Ratings */}
        <div className="flex items-center mb-3 flex-wrap gap-2">
          <div className="flex items-center">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-medium ml-1">
              {course.averageRating?.overall?.toFixed(1) || 'New'}
            </span>
            <span className="text-gray-500 text-sm ml-1">
              ({course.totalReviews || 0} reviews)
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            <span>📈 {course.views || 0} views</span>
            <span className="ml-2">👥 {course.currentEnrollments} enrolled</span>
          </div>
        </div>

        {/* Faculty Info */}
        {course.faculty && course.faculty.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Faculty:</span> {course.faculty[0].name}
              {course.faculty[0].qualification && (
                <span className="text-xs ml-1">({course.faculty[0].qualification})</span>
              )}
            </p>
          </div>
        )}

        {/* Price and Institution */}
        <div className={`flex items-center justify-between mb-4 ${isListView ? 'flex-wrap gap-4' : ''}`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {course.discount > 0 && (
                <span className="text-gray-400 line-through text-sm">₹{course.originalPrice?.toLocaleString()}</span>
              )}
              <span className="text-lg font-bold text-gray-900">₹{course.price?.toLocaleString()}</span>
              {course.discount > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  {course.discount}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              📍 {course.city}, {course.state} • ⏱️ {course.duration} • 🗣️ {course.language?.join(', ')}
            </p>
          </div>
        </div>

        {/* Institution and Action */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{course.institution?.institutionName}</span>
            <p className="text-xs mt-1">Starts: {new Date(course.startDate).toLocaleDateString()}</p>
          </div>
          
          <div className="flex gap-2">
            <button className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-2">
              ❤️
            </button>
            <a
              href={`/courses/${course._id}`}
              className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              View Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Browse UPSC Courses</h1>
        <p className="text-gray-600">
          Find the perfect course for your UPSC preparation from top institutes across India
        </p>
      </div>

      {/* Search and Quick Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search courses, institutes, cities, subjects..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courseCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courseTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {indianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>

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
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Featured Only</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.promoted}
                onChange={(e) => handleFilterChange('promoted', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Promoted Only</span>
            </label>

            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${courses.length} courses found`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
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
      ) : error && courses.length === 0 ? (
        <div className="bg-red-100 text-red-700 p-6 rounded-lg text-center">
          {error}
        </div>
      ) : courses.length === 0 ? (
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
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
          : 'space-y-6'
        }>
          {courses.map(course => (
            <CourseCard key={course._id} course={course} isListView={viewMode === 'list'} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && courses.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-12">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-md ${
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
                className={`px-4 py-2 rounded-md ${
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
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;