import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PromotedCoursesManager = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    fetchPromotedCourses();
  }, []);

  const fetchPromotedCourses = async () => {
    try {
      const response = await api.get('/api/admin/promoted-courses/homepage');
      setAvailableCourses(response.data.data.availableCourses);
      
      const homepageCourses = response.data.data.homepageSettings
        .sort((a, b) => a.order - b.order)
        .map(item => ({
          ...item.course,
          order: item.order
        }));
      setSelectedCourses(homepageCourses);
    } catch (error) {
      console.error('Error fetching promoted courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = (course) => {
    if (selectedCourses.length >= 4) {
      alert('Maximum 4 courses can be displayed on homepage');
      return;
    }
    
    if (selectedCourses.find(c => c._id === course._id)) {
      alert('Course already selected');
      return;
    }

    setSelectedCourses([...selectedCourses, { ...course, order: selectedCourses.length + 1 }]);
  };

  const handleRemoveCourse = (courseId) => {
    const updated = selectedCourses
      .filter(c => c._id !== courseId)
      .map((course, index) => ({ ...course, order: index + 1 }));
    setSelectedCourses(updated);
  };

  const handleDragEnd = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedCourses.length) return;

    const items = [...selectedCourses];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    
    const updatedItems = items.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    setSelectedCourses(updatedItems);
  };

  const handleSave = async () => {
    if (selectedCourses.length === 0) {
      alert('Please select at least one course');
      return;
    }

    setSaving(true);
    try {
      const courses = selectedCourses.map(c => ({
        courseId: c._id,
        order: c.order
      }));

      await api.put('/api/admin/promoted-courses/homepage', { courses });
      alert('Homepage promoted courses updated successfully!');
    } catch (error) {
      console.error('Error saving promoted courses:', error);
      alert('Failed to update promoted courses');
    } finally {
      setSaving(false);
    }
  };

  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.institution?.institutionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || course.promotionLevel === filterLevel;
    const notSelected = !selectedCourses.find(c => c._id === course._id);
    
    return matchesSearch && matchesFilter && notSelected;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Manage Homepage Promoted Courses
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Select and order 1-4 promoted courses to display on the homepage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Courses */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-4">Available Promoted Courses</h3>
          
          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="Search courses or institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm md:text-base"
            />
            
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm md:text-base"
            >
              <option value="all">All Promotion Levels</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCourses.map(course => (
              <div
                key={course._id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleAddCourse(course)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm md:text-base line-clamp-1">
                      {course.title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600">
                      {course.institution?.institutionName}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.promotionLevel === 'premium' ? 'bg-purple-100 text-purple-800' :
                        course.promotionLevel === 'featured' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {course.promotionLevel.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⭐ {course.averageRating?.overall?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition whitespace-nowrap">
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Courses */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Homepage Display Order</h3>
            <span className="text-sm text-gray-600">
              {selectedCourses.length}/4 selected
            </span>
          </div>

          {selectedCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No courses selected</p>
              <p className="text-sm">Click courses from the left to add them</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCourses.map((course, index) => (
                <div
                  key={course._id}
                  className="border rounded-lg p-3 bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleDragEnd(index, 'up')}
                        disabled={index === 0}
                        className={`text-gray-500 hover:text-gray-700 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleDragEnd(index, 'down')}
                        disabled={index === selectedCourses.length - 1}
                        className={`text-gray-500 hover:text-gray-700 ${index === selectedCourses.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        ▼
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-sm">#{index + 1}</span>
                          <h4 className="font-medium text-sm md:text-base line-clamp-1">
                            {course.title}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-600">
                            {course.institution?.institutionName}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveCourse(course._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || selectedCourses.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                saving || selectedCourses.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotedCoursesManager;