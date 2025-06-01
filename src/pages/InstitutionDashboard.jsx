import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const InstitutionDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [institutionData, setInstitutionData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Check authentication
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'institution') {
    window.location.href = '/login';
    return null;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      
      // Fetch institution profile
      const profileResponse = await api.get('/api/institution/profile');
      if (profileResponse.data.success) {
        setInstitutionData(profileResponse.data);
        
        // Check if institution is verified
        if (!profileResponse.data.isVerified) {
          setNotifications([{
            id: 'not-verified',
            type: 'warning',
            message: 'Your institution is pending verification. Some features may be limited.',
            permanent: true
          }]);
        }
      }

      // Fetch courses
      const coursesResponse = await api.get('/api/institution/courses');
      if (coursesResponse.data.success) {
        setCourses(coursesResponse.data.data || []);
      }

      // Fetch analytics
      try {
        const analyticsResponse = await api.get('/api/institution/analytics');
        if (analyticsResponse.data.success) {
          setAnalytics(analyticsResponse.data);
        }
      } catch (analyticsError) {
        console.error('Analytics fetch failed:', analyticsError);
        setAnalytics({
          totalViews: 0,
          totalLeads: 0,
          totalEnrollments: 0,
          conversionRate: 0,
          averageRating: 0,
          monthlyGrowth: 0,
          topPerformingCourse: 'No courses available'
        });
      }

      // Fetch enrollments
      try {
        const enrollmentsResponse = await api.get('/api/institution/enrollments');
        if (enrollmentsResponse.data.success) {
          setEnrollments(enrollmentsResponse.data.enrollments || []);
        }
      } catch (enrollmentsError) {
        console.error('Enrollments fetch failed:', enrollmentsError);
        setEnrollments([]);
      }

      // Fetch reviews
      try {
        const reviewsResponse = await api.get('/api/institution/reviews');
        if (reviewsResponse.data.success) {
          setReviews(reviewsResponse.data.reviews || []);
        }
      } catch (reviewsError) {
        console.error('Reviews fetch failed:', reviewsError);
        setReviews([]);
      }

      // Fetch earnings
      try {
        const earningsResponse = await api.get('/api/institution/earnings');
        if (earningsResponse.data.success) {
          setEarnings(earningsResponse.data);
        }
      } catch (earningsError) {
        console.error('Earnings fetch failed:', earningsError);
        setEarnings({
          totalEarnings: 0,
          thisMonthEarnings: 0,
          pendingPayouts: 0,
          completedPayouts: 0,
          monthlyBreakdown: []
        });
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      } else {
        setError('Failed to load dashboard data. Please refresh the page or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const promoteCourse = async (courseId, promotionLevel) => {
    try {
      await api.post(`/api/institution/courses/${courseId}/promote`, {
        promotionLevel
      });
      
      setCourses(courses.map(course => 
        course._id === courseId 
          ? { ...course, promotionLevel } 
          : course
      ));
      
      alert(`Course promoted to ${promotionLevel} level successfully!`);
    } catch (err) {
      console.error('Error promoting course:', err);
      alert('Failed to promote course. Please try again.');
    }
  };

  const toggleCoursePublication = async (courseId, isPublished) => {
    try {
      await api.put(`/api/institution/courses/${courseId}`, {
        isPublished: !isPublished
      });
      
      setCourses(courses.map(course => 
        course._id === courseId 
          ? { ...course, isPublished: !isPublished } 
          : course
      ));
      
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating course publication status:', err);
      alert('Failed to update course status');
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await api.delete(`/api/institution/courses/${courseId}`);
      setCourses(courses.filter(course => course._id !== courseId));
      alert('Course deleted successfully');
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course');
    }
  };

  const CourseAnalyticsCard = ({ course }) => {
    const conversionRate = course.views > 0 ? ((course.currentEnrollments / course.views) * 100).toFixed(1) : 0;
    const revenue = (course.price || 0) * (course.currentEnrollments || 0);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                course.promotionLevel === 'premium' ? 'bg-indigo-100 text-indigo-800' :
                course.promotionLevel === 'basic' ? 'bg-blue-100 text-blue-800' :
                course.promotionLevel === 'featured' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {!course.promotionLevel || course.promotionLevel === 'none' ? 'No Promotion' : course.promotionLevel.toUpperCase()}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                course.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
              {course.status === 'suspended' && (
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                  ⚠️ Suspended by Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{course.views || 0}</div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{course.shortlisted || 0}</div>
            <div className="text-xs text-gray-500">Shortlisted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{course.currentEnrollments || 0}</div>
            <div className="text-xs text-gray-500">Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{conversionRate}%</div>
            <div className="text-xs text-gray-500">Conversion</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 py-3 border-t border-gray-100">
          <div>
            <span className="text-sm text-gray-600">Rating: </span>
            <span className="font-medium text-gray-900">{course.averageRating?.overall?.toFixed(1) || '0.0'}⭐ ({course.totalReviews || 0})</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Revenue: </span>
            <span className="font-bold text-green-600">₹{revenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={`/courses/${course._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition text-center"
          >
            View Public Page
          </a>
          
          <button
            onClick={() => {
              setSelectedCourse(course);
              setShowCourseModal(true);
            }}
            className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200 transition text-center"
          >
            Analytics
          </button>
          
          {institutionData?.isVerified && course.status !== 'suspended' && (
            <select
              onChange={(e) => promoteCourse(course._id, e.target.value)}
              value={course.promotionLevel || 'none'}
              className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded text-sm font-medium cursor-pointer hover:bg-yellow-100 transition"
              disabled={!course.isPublished}
            >
              <option value="none">No Promotion</option>
              <option value="basic">Basic (₹500/mo)</option>
              <option value="premium">Premium (₹1500/mo)</option>
              <option value="featured">Featured (₹3000/mo)</option>
            </select>
          )}
          
          {course.status !== 'suspended' && (
            <button
              onClick={() => toggleCoursePublication(course._id, course.isPublished)}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                course.isPublished 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          )}

          <button
            onClick={() => deleteCourse(course._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete Course"
          >
            🗑️
          </button>
        </div>
        
        {course.adminAction && course.adminAction.reason && (
          <div className="mt-3 p-3 bg-yellow-50 rounded text-xs text-yellow-800">
            <span className="font-medium">Admin Note:</span> {course.adminAction.reason}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-20 pb-10">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-4 space-y-2">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-3 rounded-lg flex justify-between items-center ${
                notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                notif.type === 'info' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <span>{notif.message}</span>
                {!notif.permanent && (
                  <button
                    onClick={() => setNotifications(notifications.filter(n => n.id !== notif.id))}
                    className="text-sm font-medium"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Institution Dashboard</h1>
                {institutionData && (
                  <div className="mt-2">
                    <h2 className="text-xl font-semibold text-gray-800">{institutionData.institutionName || institutionData.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{institutionData.email}</span>
                      <span className="capitalize">{institutionData.institutionType || 'Institution'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        institutionData.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {institutionData.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => fetchDashboardData()}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    window.location.href = '/login';
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 mx-6 mt-6 rounded-lg">
              {error}
              <button 
                onClick={() => {
                  setError('');
                  fetchDashboardData();
                }}
                className="ml-4 text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Overview', icon: '📊' },
                { id: 'courses', label: 'My Courses', icon: '📚', count: courses.length },
                { id: 'addCourse', label: 'Add Course', icon: '➕' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'enrollments', label: 'Enrollments', icon: '👥', count: enrollments.length },
                { id: 'reviews', label: 'Reviews', icon: '⭐', count: reviews.length },
                { id: 'earnings', label: 'Earnings', icon: '💰' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center">
                    {tab.icon} {tab.label} 
                    {tab.count !== undefined && (
                      <span className="ml-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Dashboard Overview */}
            {activeTab === 'dashboard' && analytics && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-blue-900">Total Views</h3>
                        <p className="text-2xl font-bold text-blue-900">{analytics.totalViews}</p>
                        <p className="text-xs text-blue-700">+{analytics.monthlyGrowth}% this month</p>
                      </div>
                      <div className="text-2xl">👀</div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-purple-900">Total Leads</h3>
                        <p className="text-2xl font-bold text-purple-900">{analytics.totalLeads}</p>
                        <p className="text-xs text-purple-700">From shortlisting</p>
                      </div>
                      <div className="text-2xl">🎯</div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-green-900">Total Enrollments</h3>
                        <p className="text-2xl font-bold text-green-900">{analytics.totalEnrollments}</p>
                        <p className="text-xs text-green-700">{analytics.conversionRate}% conversion rate</p>
                      </div>
                      <div className="text-2xl">📚</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-yellow-900">Average Rating</h3>
                        <p className="text-2xl font-bold text-yellow-900">{analytics.averageRating}⭐</p>
                        <p className="text-xs text-yellow-700">Across all courses</p>
                      </div>
                      <div className="text-2xl">⭐</div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Course */}
                {analytics.topPerformingCourse && analytics.topPerformingCourse !== 'No courses available' && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">🏆 Top Performing Course</h3>
                    <p className="text-xl font-bold text-gray-800">{analytics.topPerformingCourse}</p>
                    <p className="text-sm text-gray-600">Leading in enrollments and ratings</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('addCourse')}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center group"
                      disabled={!institutionData?.isVerified}
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">➕</div>
                      <h3 className="font-medium text-gray-900">Add New Course</h3>
                      <p className="text-sm text-gray-600">
                        {institutionData?.isVerified ? 'Create and publish a new course' : 'Available after verification'}
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center group"
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📈</div>
                      <h3 className="font-medium text-gray-900">View Analytics</h3>
                      <p className="text-sm text-gray-600">Detailed performance insights</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('earnings')}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center group"
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💰</div>
                      <h3 className="font-medium text-gray-900">Check Earnings</h3>
                      <p className="text-sm text-gray-600">Revenue and payout details</p>
                    </button>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Enrollments</h3>
                    {enrollments.length > 0 ? (
                      <div className="space-y-3">
                        {enrollments.slice(0, 5).map((enrollment, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-medium">{enrollment.student?.name || 'Student'}</p>
                              <p className="text-sm text-gray-600">{enrollment.courseTitle}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4">No recent enrollments</p>
                    )}
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
                    {reviews.length > 0 ? (
                      <div className="space-y-3">
                        {reviews.slice(0, 5).map((review, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                              <p className="font-medium line-clamp-1">{review.course.title}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-yellow-500">{review.courseRating}⭐</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  review.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  review.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {review.verificationStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4">No reviews yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                  <button 
                    onClick={() => setActiveTab('addCourse')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    disabled={!institutionData?.isVerified}
                  >
                    + Add New Course
                  </button>
                </div>

                {!institutionData?.isVerified && (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-yellow-800">
                    <p className="font-medium">⚠️ Institution Not Verified</p>
                    <p className="text-sm mt-1">You can create courses, but they cannot be published until your institution is verified by an admin.</p>
                  </div>
                )}

                {courses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No courses created yet</h3>
                    <p className="text-gray-600 mb-4">
                      {institutionData?.isVerified 
                        ? 'Create your first course to start attracting students' 
                        : 'Create courses now, publish after verification'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('addCourse')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                      disabled={!institutionData?.isVerified}
                    >
                      Create First Course
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {courses.map((course) => (
                      <CourseAnalyticsCard key={course._id} course={course} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Course Tab */}
            {activeTab === 'addCourse' && (
              <CourseForm 
                mode="add" 
                onCancel={() => setActiveTab('courses')} 
                onSuccess={(newCourse) => {
                  setCourses([newCourse, ...courses]);
                  setActiveTab('courses');
                  setError('');
                  fetchDashboardData();
                }}
                setError={setError}
                isVerified={institutionData?.isVerified}
              />
            )}

            {/* Enrollments Tab */}
            {activeTab === 'enrollments' && (
              <div>
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Student Enrollments</h2>
                {enrollments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No enrollments yet</h3>
                    <p className="text-gray-600">Enrollments will appear here once students start joining your courses</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrolled Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {enrollments.map((enrollment) => (
                          <tr key={enrollment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {enrollment.student?.name || enrollment.user?.name || 'Student'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {enrollment.student?.email || enrollment.user?.email || '-'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{enrollment.courseTitle || enrollment.course?.title || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                enrollment.paymentStatus === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : enrollment.paymentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {enrollment.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{(enrollment.amount || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">Detailed Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Performance Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Views</span>
                        <span className="font-medium">{analytics.totalViews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Leads</span>
                        <span className="font-medium">{analytics.totalLeads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversion Rate</span>
                        <span className="font-medium">{analytics.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Course Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published Courses</span>
                        <span className="font-medium">{courses.filter(c => c.isPublished).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Draft Courses</span>
                        <span className="font-medium">{courses.filter(c => !c.isPublished).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Rating</span>
                        <span className="font-medium">{analytics.averageRating}⭐</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Growth Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Growth</span>
                        <span className="font-medium text-green-600">+{analytics.monthlyGrowth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Students</span>
                        <span className="font-medium">{analytics.totalEnrollments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Reviews</span>
                        <span className="font-medium">{reviews.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <h3 className="text-lg font-medium mb-4">Monthly Performance Trends</h3>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-600">Interactive charts would be implemented here</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Student Reviews</h2>
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Student reviews will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="bg-white border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{review.course.title}</h3>
                            <p className="text-sm text-gray-600">By: {review.user?.name || 'Anonymous'}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm">
                              <span>Course: {review.courseRating}⭐</span>
                              <span>Institute: {review.instituteRating}⭐</span>
                              <span>Faculty: {review.facultyRating}⭐</span>
                            </div>
                            <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                              review.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              review.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {review.verificationStatus}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{review.reviewText}</p>
                        
                        {review.rejectionReason && (
                          <div className="bg-red-50 p-3 rounded text-sm text-red-800 mb-4">
                            <span className="font-medium">Admin Feedback:</span> {review.rejectionReason}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          <span>👍 {review.helpfulVotes || 0} found helpful</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === 'earnings' && earnings && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">Earnings Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                    <h3 className="text-sm font-medium text-green-900">Total Earnings</h3>
                    <p className="text-2xl font-bold text-green-900">₹{earnings.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-green-700">All time</p>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-900">This Month</h3>
                    <p className="text-2xl font-bold text-blue-900">₹{earnings.thisMonthEarnings.toLocaleString()}</p>
                    <p className="text-xs text-blue-700">Current month</p>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                    <h3 className="text-sm font-medium text-yellow-900">Pending Payouts</h3>
                    <p className="text-2xl font-bold text-yellow-900">₹{earnings.pendingPayouts.toLocaleString()}</p>
                    <p className="text-xs text-yellow-700">Processing</p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                    <h3 className="text-sm font-medium text-purple-900">Completed Payouts</h3>
                    <p className="text-2xl font-bold text-purple-900">₹{earnings.completedPayouts.toLocaleString()}</p>
                    <p className="text-xs text-purple-700">Received</p>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Monthly Breakdown</h3>
                  <div className="space-y-3">
                    {earnings.monthlyBreakdown.map((month, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium">{month.month}</span>
                        <span className="font-bold">₹{month.earnings.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">Institution Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution Name
                        </label>
                        <input
                          type="text"
                          defaultValue={institutionData?.institutionName}
                          className="w-full px-3 py-2 border rounded-lg"
                          disabled={!institutionData?.isVerified}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          defaultValue={institutionData?.email}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution Type
                        </label>
                        <select
                          defaultValue={institutionData?.institutionType}
                          className="w-full px-3 py-2 border rounded-lg"
                          disabled={!institutionData?.isVerified}
                        >
                          <option value="coaching">Coaching Institute</option>
                          <option value="university">University</option>
                          <option value="college">College</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Email notifications for new enrollments</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Email notifications for new reviews</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Weekly performance summary</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Marketing tips and updates</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="Enter account number"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          placeholder="Enter IFSC code"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          placeholder="Enter PAN number"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Security</h3>
                    <div className="space-y-4">
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        Change Password
                      </button>
                      <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                        Enable Two-Factor Authentication
                      </button>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">Danger Zone</p>
                        <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Course Analytics Modal */}
        {showCourseModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">Course Analytics: {selectedCourse.title}</h2>
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-900">{selectedCourse.views || 0}</p>
                      <p className="text-sm text-blue-700">Total Views</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-900">{selectedCourse.shortlisted || 0}</p>
                      <p className="text-sm text-purple-700">Shortlisted</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-900">{selectedCourse.currentEnrollments || 0}</p>
                      <p className="text-sm text-green-700">Enrollments</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-900">
                        ₹{((selectedCourse.price || 0) * (selectedCourse.currentEnrollments || 0)).toLocaleString()}
                      </p>
                      <p className="text-sm text-yellow-700">Revenue</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Performance Metrics</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Conversion Rate</span>
                          <span className="font-medium">
                            {selectedCourse.views > 0 
                              ? ((selectedCourse.currentEnrollments / selectedCourse.views) * 100).toFixed(1) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Rating</span>
                          <span className="font-medium">{selectedCourse.averageRating?.overall?.toFixed(1) || '0.0'}⭐</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Reviews</span>
                          <span className="font-medium">{selectedCourse.totalReviews || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Course Status</span>
                          <span className={`font-medium ${
                            selectedCourse.isPublished ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {selectedCourse.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Recent Activity</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        This section would show recent enrollments, reviews, and other activities related to this course.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <a
                      href={`/courses/${selectedCourse._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      View Public Page
                    </a>
                    <button
                      onClick={() => {
                        setActiveTab('courses');
                        setShowCourseModal(false);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Course Form Component
const CourseForm = ({ mode, course, onCancel, onSuccess, setError, isVerified }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    price: course?.price || '',
    originalPrice: course?.originalPrice || '',
    discount: course?.discount || 0,
    duration: course?.duration || '1 month',
    courseCategory: course?.courseCategory || 'prelims',
    courseType: course?.courseType || ['online'],
    subjects: course?.subjects?.join(', ') || '',
    language: course?.courseLanguages || ['english'],
    city: course?.city || '',
    state: course?.state || '',
    address: course?.address || '',
    startDate: course?.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
    endDate: course?.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
    maxStudents: course?.maxStudents || 0,
    deliveryType: course?.deliveryType || 'live',
    isPublished: course?.isPublished || false,
    tags: course?.tags?.join(', ') || '',
    syllabusFile: null,
    existingSyllabusFile: course?.syllabusFile || null,
    faculty: course?.faculty || [{ name: '', qualification: '', experience: '', subject: '' }]
  });
  
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  
  // Form options
  const durationOptions = [
    '1 week', '2 weeks', '1 month', '2 months', 
    '3 months', '6 months', '1 year', 'Other'
  ];
  
  const categoryOptions = [
    { value: 'prelims', label: 'Prelims' },
    { value: 'mains', label: 'Mains' },
    { value: 'prelims-cum-mains', label: 'Prelims + Mains' },
    { value: 'optionals', label: 'Optionals' },
    { value: 'test-series', label: 'Test Series' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'interview', label: 'Interview Guidance' }
  ];
  
  const courseTypeOptions = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'weekend', label: 'Weekend Batches' },
    { value: 'evening', label: 'Evening Batches' }
  ];
  
  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'gujarati', label: 'Gujarati' }
  ];
  
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'courseType') {
        const updatedCourseTypes = [...formData.courseType];
        if (checked) {
          updatedCourseTypes.push(value);
        } else {
          const index = updatedCourseTypes.indexOf(value);
          if (index !== -1) {
            updatedCourseTypes.splice(index, 1);
          }
        }
        setFormData({ ...formData, courseType: updatedCourseTypes });
      } else if (name === 'language') {
        const updatedLanguages = [...formData.language];
        if (checked) {
          updatedLanguages.push(value);
        } else {
          const index = updatedLanguages.indexOf(value);
          if (index !== -1) {
            updatedLanguages.splice(index, 1);
          }
        }
        setFormData({ ...formData, language: updatedLanguages });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else if (type === 'file') {
      if (files[0]) {
        const fileType = files[0].type;
        if (fileType !== 'application/pdf') {
          setFileError('Only PDF files are allowed');
          return;
        }
        
        if (files[0].size > 5 * 1024 * 1024) {
          setFileError('File size should be less than 5MB');
          return;
        }
        
        setFileError('');
        setFormData({ ...formData, [name]: files[0] });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFacultyChange = (index, field, value) => {
    const updatedFaculty = [...formData.faculty];
    updatedFaculty[index][field] = value;
    setFormData({ ...formData, faculty: updatedFaculty });
  };

  const addFaculty = () => {
    setFormData({
      ...formData,
      faculty: [...formData.faculty, { name: '', qualification: '', experience: '', subject: '' }]
    });
  };

  const removeFaculty = (index) => {
    if (formData.faculty.length > 1) {
      const updatedFaculty = formData.faculty.filter((_, i) => i !== index);
      setFormData({ ...formData, faculty: updatedFaculty });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.title || !formData.description || !formData.price || !formData.startDate || !formData.endDate) {
        throw new Error('Please fill all required fields');
      }
      
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('End date must be after start date');
      }
      
      const subjects = formData.subjects
        .split(',')
        .map(subject => subject.trim())
        .filter(subject => subject !== '');
      
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      const courseData = new FormData();
      courseData.append('title', formData.title);
      courseData.append('description', formData.description);
      courseData.append('price', formData.price);
      courseData.append('originalPrice', formData.originalPrice || formData.price);
      courseData.append('discount', formData.discount);
      courseData.append('duration', formData.duration);
      courseData.append('courseCategory', formData.courseCategory);
      courseData.append('courseType', JSON.stringify(formData.courseType));
      courseData.append('subjects', JSON.stringify(subjects));
      courseData.append('courseLanguages', JSON.stringify(formData.language));
      courseData.append('city', formData.city);
      courseData.append('state', formData.state);
      courseData.append('address', formData.address);
      courseData.append('startDate', formData.startDate);
      courseData.append('endDate', formData.endDate);
      courseData.append('maxStudents', formData.maxStudents);
      courseData.append('deliveryType', formData.deliveryType);
      courseData.append('isPublished', isVerified ? formData.isPublished : false);
      courseData.append('tags', JSON.stringify(tags));
      courseData.append('faculty', JSON.stringify(formData.faculty));
      
      if (formData.syllabusFile) {
        courseData.append('syllabusFile', formData.syllabusFile);
      }
      
      let response;
      
      if (mode === 'add') {
        response = await api.post('/api/institution/courses', courseData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.put(`/api/institution/courses/${course._id}`, courseData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        throw new Error(response.data.message || 'Course creation failed');
      }
    } catch (error) {
      console.error('Course form submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save course';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        {mode === 'add' ? 'Add New Course' : 'Edit Course'}
      </h2>
      
      {!isVerified && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-yellow-800">
          <p className="font-medium">⚠️ Institution Not Verified</p>
          <p className="text-sm mt-1">You can create courses, but they cannot be published until your institution is verified.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Category*
              </label>
              <select
                name="courseCategory"
                value={formData.courseCategory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjects (comma separated)
            </label>
            <input
              type="text"
              name="subjects"
              value={formData.subjects}
              onChange={handleChange}
              placeholder="e.g. History, Geography, Polity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Pricing and Duration */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Pricing & Duration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration*
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {durationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Course Type and Language */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Course Type & Language</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Type(s)*
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {courseTypeOptions.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`courseType-${option.value}`}
                    name="courseType"
                    value={option.value}
                    checked={formData.courseType.includes(option.value)}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`courseType-${option.value}`} className="ml-2 block text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language(s)*
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {languageOptions.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`language-${option.value}`}
                    name="language"
                    value={option.value}
                    checked={formData.language.includes(option.value)}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`language-${option.value}`} className="ml-2 block text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Faculty Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Faculty Information</h3>
            <button
              type="button"
              onClick={addFaculty}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              + Add Faculty
            </button>
          </div>
          
          {formData.faculty.map((faculty, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg mb-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Faculty {index + 1}</h4>
                {formData.faculty.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFaculty(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faculty Name*
                  </label>
                  <input
                    type="text"
                    value={faculty.name}
                    onChange={(e) => handleFacultyChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={faculty.subject}
                    onChange={(e) => handleFacultyChange(index, 'subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={faculty.qualification}
                    onChange={(e) => handleFacultyChange(index, 'qualification', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={faculty.experience}
                    onChange={(e) => handleFacultyChange(index, 'experience', e.target.value)}
                    placeholder="e.g. 5 years"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Location Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Location Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Complete address for offline/hybrid courses"
            ></textarea>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Additional Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Students (0 for unlimited)
              </label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Type
              </label>
              <select
                name="deliveryType"
                value={formData.deliveryType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="live">Live Classes</option>
                <option value="recorded">Recorded Classes</option>
                <option value="hybrid">Live + Recorded</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. UPSC, IAS, Civil Services"
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Course Materials</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Syllabus File (PDF only)
            </label>
            {formData.existingSyllabusFile && (
              <div className="flex items-center mb-2">
                <span className="text-sm text-blue-600 mr-2">📄 Current syllabus file</span>
              </div>
            )}
            <input
              type="file"
              name="syllabusFile"
              onChange={handleChange}
              accept=".pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
            <p className="text-gray-500 text-xs mt-1">Max size: 5MB</p>
          </div>
        </div>

        {/* Publication */}
        {isVerified && (
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublished"
              id="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
              Publish this course (make it visible to students)
            </label>
          </div>
        )}
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || formData.courseType.length === 0 || formData.language.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Course...
              </>
            ) : (
              mode === 'add' ? 'Create Course' : 'Update Course'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstitutionDashboard;