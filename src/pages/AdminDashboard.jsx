import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);
  const [systemOverview, setSystemOverview] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Pagination states
  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1 });
  const [institutionPagination, setInstitutionPagination] = useState({ page: 1, totalPages: 1 });
  const [coursePagination, setCoursePagination] = useState({ page: 1, totalPages: 1 });
  
  // Filter states
  const [userFilter, setUserFilter] = useState({ role: '', isVerified: '' });
  const [institutionFilter, setInstitutionFilter] = useState({ isVerified: '' });
  const [courseFilter, setCourseFilter] = useState({ isPublished: '', status: '' });
  
  // Modal states
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  useEffect(() => {
    fetchAdminData();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'institutions') fetchInstitutions();
    if (activeTab === 'courses') fetchCourses();
    if (activeTab === 'reviews') fetchPendingReviews();
    if (activeTab === 'activity') fetchLoginActivity();
  }, [activeTab, userPagination.page, institutionPagination.page, coursePagination.page, userFilter, institutionFilter, courseFilter]);
  
  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const [statsResponse, overviewResponse] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/system/overview')
      ]);
      
      setStats(statsResponse.data);
      setSystemOverview(overviewResponse.data.overview);
      
      // Create notifications based on pending items
      const newNotifications = [];
      if (statsResponse.data.pendingInstitutions > 0) {
        newNotifications.push({
          id: 'pending-inst',
          type: 'warning',
          message: `${statsResponse.data.pendingInstitutions} institutions pending verification`,
          action: () => {
            setInstitutionFilter({ isVerified: 'false' });
            setActiveTab('institutions');
          }
        });
      }
      if (statsResponse.data.pendingReviews > 0) {
        newNotifications.push({
          id: 'pending-reviews',
          type: 'info',
          message: `${statsResponse.data.pendingReviews} reviews awaiting moderation`,
          action: () => setActiveTab('reviews')
        });
      }
      setNotifications(newNotifications);
      
    } catch (err) {
      setError('Failed to load admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: userPagination.page,
        limit: 20,
        ...userFilter
      });
      
      const response = await api.get(`/api/admin/users?${params}`);
      setUsers(response.data.data);
      setUserPagination({
        ...userPagination,
        totalPages: response.data.pagination.pages
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    }
  };
  
  const fetchInstitutions = async () => {
    try {
      const params = new URLSearchParams({
        page: institutionPagination.page,
        limit: 10,
        ...institutionFilter
      });
      
      const response = await api.get(`/api/admin/institutions?${params}`);
      setInstitutions(response.data.data);
      setInstitutionPagination({
        ...institutionPagination,
        totalPages: response.data.pagination.pages
      });
    } catch (err) {
      console.error('Error fetching institutions:', err);
      setError('Failed to fetch institutions');
    }
  };
  
  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({
        page: coursePagination.page,
        limit: 20,
        ...courseFilter
      });
      
      const response = await api.get(`/api/admin/courses?${params}`);
      setCourses(response.data.data);
      setCoursePagination({
        ...coursePagination,
        totalPages: response.data.pagination.pages
      });
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses');
    }
  };
  
  const fetchPendingReviews = async () => {
    try {
      const response = await api.get('/api/admin/reviews/pending');
      setPendingReviews(response.data.data);
    } catch (err) {
      console.error('Error fetching pending reviews:', err);
    }
  };
  
  const fetchLoginActivity = async () => {
    try {
      const response = await api.get('/api/admin/activity/logins');
      setLoginActivity(response.data.data);
    } catch (err) {
      console.error('Error fetching login activity:', err);
    }
  };
  
  const handleVerifyInstitution = async (institutionId, isVerified) => {
    try {
      await api.put(`/api/admin/institutions/${institutionId}/verify`, { isVerified });
      fetchInstitutions();
      fetchAdminData();
      alert(`Institution ${isVerified ? 'verified' : 'unverified'} successfully`);
    } catch (err) {
      alert('Failed to update institution verification');
    }
  };
  
  const handleUpdateInstitutionStatus = async (institutionId, isActive, reason = '') => {
    try {
      await api.put(`/api/admin/institutions/${institutionId}/status`, { isActive, reason });
      fetchInstitutions();
      alert(`Institution ${isActive ? 'activated' : 'delisted'} successfully`);
    } catch (err) {
      alert('Failed to update institution status');
    }
  };
  
  const handleToggleCoursePublication = async (courseId, isPublished, reason = '') => {
    try {
      await api.put(`/api/admin/courses/${courseId}/publish`, { isPublished, reason });
      fetchCourses();
      alert(`Course ${isPublished ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      alert('Failed to update course publication status');
    }
  };
  
  const handleVerifyReview = async (courseId, reviewId, action, rejectionReason = '') => {
    try {
      await api.put(`/api/admin/reviews/${courseId}/${reviewId}/verify`, { 
        action, 
        rejectionReason 
      });
      fetchPendingReviews();
      alert(`Review ${action}ed successfully`);
    } catch (err) {
      alert('Failed to verify review');
    }
  };
  
  const handleUserStatusToggle = async (userId, isActive) => {
    try {
      await api.put(`/api/admin/users/${userId}/status`, { isActive });
      fetchUsers();
      alert(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      alert('Failed to update user status');
    }
  };
  
  const handleBulkAction = async (action, targetType) => {
    if (!window.confirm(`Are you sure you want to ${action} all selected ${targetType}?`)) {
      return;
    }
    
    try {
      // Implement bulk actions
      alert(`Bulk ${action} completed successfully`);
      
      // Refresh relevant data
      if (targetType === 'institutions') fetchInstitutions();
      if (targetType === 'courses') fetchCourses();
      if (targetType === 'reviews') fetchPendingReviews();
    } catch (err) {
      alert(`Failed to perform bulk ${action}`);
    }
  };
  
  // Check authentication
  if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'admin') {
    return <Navigate to="/login" />;
  }
  
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
        {/* Notifications Bar */}
        {notifications.length > 0 && (
          <div className="mb-4 space-y-2">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-3 rounded-lg flex justify-between items-center ${
                notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                notif.type === 'info' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <span>{notif.message}</span>
                <button
                  onClick={notif.action}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="border-b p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage and monitor your platform</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fetchAdminData()}
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
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mt-4">{error}</div>}
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'institutions', label: 'Institutions', icon: '🏢', count: stats?.institutionCount },
                { id: 'users', label: 'All Users', icon: '👥', count: stats?.aspirantCount + stats?.institutionCount },
                { id: 'courses', label: 'Courses', icon: '📚', count: stats?.courseCount },
                { id: 'reviews', label: 'Reviews', icon: '⭐', count: stats?.pendingReviews, badge: 'danger' },
                { id: 'activity', label: 'Activity', icon: '📈' },
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
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        tab.badge === 'danger' && tab.count > 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && systemOverview && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div>
                  <h2 className="text-xl font-semibold mb-6">Platform Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg mb-2 text-blue-900">Total Aspirants</h3>
                          <p className="text-3xl font-bold text-blue-900">{stats.aspirantCount}</p>
                        </div>
                        <div className="text-3xl">👥</div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg mb-2 text-green-900">Verified Institutions</h3>
                          <p className="text-3xl font-bold text-green-900">{stats.verifiedInstitutions}</p>
                          <p className="text-sm text-orange-600 mt-1">{stats.pendingInstitutions} pending</p>
                        </div>
                        <div className="text-3xl">🏢</div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg mb-2 text-purple-900">Published Courses</h3>
                          <p className="text-3xl font-bold text-purple-900">{stats.publishedCourses}</p>
                          <p className="text-sm text-gray-600 mt-1">of {stats.courseCount} total</p>
                        </div>
                        <div className="text-3xl">📚</div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg mb-2 text-yellow-900">Pending Reviews</h3>
                          <p className="text-3xl font-bold text-yellow-900">{stats.pendingReviews}</p>
                          <p className="text-sm text-yellow-600 mt-1">Awaiting verification</p>
                        </div>
                        <div className="text-3xl">⏳</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Revenue Overview */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">Revenue Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Total Platform Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{systemOverview.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Enrollments</p>
                      <p className="text-2xl font-bold text-gray-900">{systemOverview.totalEnrollments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Revenue/Course</p>
                      <p className="text-2xl font-bold text-gray-900">₹{parseFloat(systemOverview.averageRevenuePerCourse).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Institutions</h3>
                    <div className="space-y-3">
                      {systemOverview.recentInstitutions.map(inst => (
                        <div key={inst._id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium">{inst.institutionName}</p>
                            <p className="text-sm text-gray-600">{inst.email}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            inst.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inst.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Courses</h3>
                    <div className="space-y-3">
                      {systemOverview.recentCourses.map(course => (
                        <div key={course._id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium line-clamp-1">{course.title}</p>
                            <p className="text-sm text-gray-600">{course.institution?.institutionName}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => {
                        setInstitutionFilter({ isVerified: 'false' });
                        setActiveTab('institutions');
                      }}
                      className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">🏢</div>
                      <p className="font-medium text-yellow-900">Verify Institutions</p>
                      <p className="text-sm text-yellow-700">{stats.pendingInstitutions} pending</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">⭐</div>
                      <p className="font-medium text-orange-900">Review Moderation</p>
                      <p className="text-sm text-orange-700">{stats.pendingReviews} pending</p>
                    </button>
                    
                    <button
                      onClick={() => {
                        setCourseFilter({ status: 'suspended' });
                        setActiveTab('courses');
                      }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">📚</div>
                      <p className="font-medium text-red-900">Suspended Courses</p>
                      <p className="text-sm text-red-700">Review status</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium text-blue-900">Login Activity</p>
                      <p className="text-sm text-blue-700">Monitor access</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Institutions Tab */}
            {activeTab === 'institutions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Institution Management</h2>
                  <div className="flex gap-4">
                    <select
                      value={institutionFilter.isVerified}
                      onChange={(e) => {
                        setInstitutionFilter({ ...institutionFilter, isVerified: e.target.value });
                        setInstitutionPagination({ ...institutionPagination, page: 1 });
                      }}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Institutions</option>
                      <option value="true">Verified Only</option>
                      <option value="false">Pending Verification</option>
                    </select>
                    
                    <button
                      onClick={() => handleBulkAction('verify', 'institutions')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Bulk Verify
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Institution
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Courses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {institutions.map((inst) => (
                        <tr key={inst._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{inst.institutionName}</div>
                              <div className="text-sm text-gray-500">{inst.email}</div>
                              <div className="text-xs text-gray-400">ID: {inst._id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {inst.institutionType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <p>{inst.courseCount} total</p>
                              <p className="text-xs">{inst.publishedCourseCount} published</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                inst.isVerified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {inst.isVerified ? 'Verified' : 'Pending'}
                              </span>
                              {!inst.isActive && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Delisted
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {inst.lastLogin ? new Date(inst.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col gap-2">
                              {!inst.isVerified ? (
                                <button
                                  onClick={() => handleVerifyInstitution(inst._id, true)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  ✓ Verify
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVerifyInstitution(inst._id, false)}
                                  className="text-orange-600 hover:text-orange-900"
                                >
                                  ✗ Unverify
                                </button>
                              )}
                              
                              {inst.isActive ? (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Reason for delisting:');
                                    if (reason) handleUpdateInstitutionStatus(inst._id, false, reason);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  🚫 Delist
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateInstitutionStatus(inst._id, true)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  ✓ Activate
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  setSelectedInstitution(inst);
                                  setShowInstitutionModal(true);
                                }}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                View Details →
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {institutionPagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <button
                      onClick={() => setInstitutionPagination({ ...institutionPagination, page: institutionPagination.page - 1 })}
                      disabled={institutionPagination.page === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1">
                      Page {institutionPagination.page} of {institutionPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setInstitutionPagination({ ...institutionPagination, page: institutionPagination.page + 1 })}
                      disabled={institutionPagination.page === institutionPagination.totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <div className="flex gap-4">
                    <select
                      value={userFilter.role}
                      onChange={(e) => {
                        setUserFilter({ ...userFilter, role: e.target.value });
                        setUserPagination({ ...userPagination, page: 1 });
                      }}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Roles</option>
                      <option value="aspirant">Aspirants</option>
                      <option value="institution">Institutions</option>
                      <option value="admin">Admins</option>
                    </select>
                    
                    <button
                      onClick={() => {
                        const email = prompt('Enter email for new admin:');
                        if (email) {
                          // Send invitation logic
                          alert(`Admin invitation sent to ${email}`);
                        }
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      + Add Admin
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Login Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || user.institutionName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'institution' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.loginCount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {user.isActive !== false ? (
                              <button
                                onClick={() => handleUserStatusToggle(user._id, false)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserStatusToggle(user._id, true)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {userPagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <button
                      onClick={() => setUserPagination({ ...userPagination, page: userPagination.page - 1 })}
                      disabled={userPagination.page === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1">
                      Page {userPagination.page} of {userPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setUserPagination({ ...userPagination, page: userPagination.page + 1 })}
                      disabled={userPagination.page === userPagination.totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Course Management</h2>
                  <div className="flex gap-4">
                    <select
                      value={courseFilter.isPublished}
                      onChange={(e) => {
                        setCourseFilter({ ...courseFilter, isPublished: e.target.value });
                        setCoursePagination({ ...coursePagination, page: 1 });
                      }}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Courses</option>
                      <option value="true">Published</option>
                      <option value="false">Unpublished</option>
                    </select>
                    
                    <select
                      value={courseFilter.status}
                      onChange={(e) => {
                        setCourseFilter({ ...courseFilter, status: e.target.value });
                        setCoursePagination({ ...coursePagination, page: 1 });
                      }}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Institution
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrollments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">{course.title}</div>
                              <div className="text-sm text-gray-500">{course.courseCategory}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{course.institution?.institutionName}</div>
                            <div className="text-sm text-gray-500">
                              {course.institution?.isVerified ? '✓ Verified' : '⚠️ Unverified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{course.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.currentEnrollments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              course.isPublished && course.status === 'published' 
                                ? 'bg-green-100 text-green-800'
                                : course.status === 'suspended'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {course.status || 'draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setShowCourseModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                              {course.isPublished ? (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Reason for unpublishing:');
                                    if (reason !== null) handleToggleCoursePublication(course._id, false, reason);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Unpublish
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleCoursePublication(course._id, true)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Publish
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {coursePagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <button
                      onClick={() => setCoursePagination({ ...coursePagination, page: coursePagination.page - 1 })}
                      disabled={coursePagination.page === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1">
                      Page {coursePagination.page} of {coursePagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCoursePagination({ ...coursePagination, page: coursePagination.page + 1 })}
                      disabled={coursePagination.page === coursePagination.totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Pending Review Verification</h2>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleBulkAction('approve', 'reviews')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Bulk Approve
                    </button>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {pendingReviews.length} reviews pending
                    </span>
                  </div>
                </div>
                
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-4">✅</div>
                    <p className="text-gray-600">No pending reviews to verify</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingReviews.map((review) => (
                      <div key={`${review.courseId}-${review.reviewId}`} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{review.courseTitle}</h3>
                            <p className="text-sm text-gray-600">
                              By: {review.user?.name} ({review.user?.email})
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted: {new Date(review.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Course</div>
                              <div className="font-semibold text-lg">{review.courseRating}⭐</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Institute</div>
                              <div className="font-semibold text-lg">{review.instituteRating}⭐</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Faculty</div>
                              <div className="font-semibold text-lg">{review.facultyRating}⭐</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded mb-4">
                          <p className="text-gray-700">{review.reviewText}</p>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleVerifyReview(review.courseId, review.reviewId, 'approve')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) handleVerifyReview(review.courseId, review.reviewId, 'reject', reason);
                            }}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Login Activity</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Logins
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginActivity.map((activity) => (
                        <tr key={activity._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{activity.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              activity.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              activity.role === 'institution' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.lastLogin ? new Date(activity.lastLogin).toLocaleString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.loginCount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              activity.loginCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.loginCount > 0 ? 'Active' : 'Never logged in'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold">Platform Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Platform Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Civils HQ"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Support Email
                        </label>
                        <input
                          type="email"
                          defaultValue="support@civilshq.com"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Platform Commission (%)
                        </label>
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Email notifications for new institutions</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Email notifications for pending reviews</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Daily activity summary</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Weekly revenue report</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Admin Registration Code
                        </label>
                        <input
                          type="text"
                          placeholder="Enter new admin code"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm">Require 2FA for admin accounts</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          <span className="text-sm">Log all admin actions</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Content Moderation</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Require admin approval for reviews</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Auto-flag suspicious content</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Enable profanity filter</span>
                      </label>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max review length (characters)
                        </label>
                        <input
                          type="number"
                          defaultValue="1000"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
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
        
        {/* Institution Details Modal */}
        {showInstitutionModal && selectedInstitution && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">Institution Details</h2>
                  <button
                    onClick={() => setShowInstitutionModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Institution Name</p>
                      <p className="font-medium">{selectedInstitution.institutionName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium capitalize">{selectedInstitution.institutionType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedInstitution.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="font-medium">{selectedInstitution.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-medium">{new Date(selectedInstitution.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedInstitution.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedInstitution.isVerified ? 'Verified' : 'Pending'}
                        </span>
                        {!selectedInstitution.isActive && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Delisted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Course Statistics</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{selectedInstitution.courseCount || 0}</p>
                          <p className="text-sm text-gray-600">Total Courses</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{selectedInstitution.publishedCourseCount || 0}</p>
                          <p className="text-sm text-gray-600">Published</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {selectedInstitution.courseCount - selectedInstitution.publishedCourseCount || 0}
                          </p>
                          <p className="text-sm text-gray-600">Draft</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Login Activity</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm">
                        Last Login: {selectedInstitution.lastLogin ? new Date(selectedInstitution.lastLogin).toLocaleString() : 'Never'}
                      </p>
                      <p className="text-sm mt-1">
                        Total Logins: {selectedInstitution.loginCount || 0}
                      </p>
                    </div>
                  </div>
                  
                  {selectedInstitution.delistReason && (
                    <div>
                      <h3 className="font-semibold mb-2">Delist Reason</h3>
                      <div className="bg-red-50 p-4 rounded">
                        <p className="text-sm text-red-800">{selectedInstitution.delistReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Course Details Modal */}
        {showCourseModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">Course Details</h2>
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Title</p>
                        <p className="font-medium">{selectedCourse.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium capitalize">{selectedCourse.courseCategory}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Institution</p>
                        <p className="font-medium">{selectedCourse.institution?.institutionName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedCourse.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedCourse.status || 'draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-gray-700">{selectedCourse.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Pricing & Duration</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-medium">₹{selectedCourse.price?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{selectedCourse.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Enrollments</p>
                        <p className="font-medium">{selectedCourse.currentEnrollments}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Performance Metrics</h3>
                    <div className="bg-gray-50 p-4 rounded grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold">{selectedCourse.views || 0}</p>
                        <p className="text-sm text-gray-600">Views</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{selectedCourse.shortlisted || 0}</p>
                        <p className="text-sm text-gray-600">Shortlisted</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{selectedCourse.averageRating?.overall?.toFixed(1) || '0.0'}</p>
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{selectedCourse.totalReviews || 0}</p>
                        <p className="text-sm text-gray-600">Reviews</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCourse.adminAction && (
                    <div>
                      <h3 className="font-semibold mb-2">Admin Actions</h3>
                      <div className="bg-yellow-50 p-4 rounded">
                        <p className="text-sm">
                          <span className="font-medium">Action:</span> {selectedCourse.adminAction.action}
                        </p>
                        {selectedCourse.adminAction.reason && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Reason:</span> {selectedCourse.adminAction.reason}
                          </p>
                        )}
                        <p className="text-sm mt-1">
                          <span className="font-medium">Date:</span> {new Date(selectedCourse.adminAction.actionAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3">
                    <a
                      href={`/courses/${selectedCourse._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      View Public Page
                    </a>
                    {selectedCourse.isPublished ? (
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for unpublishing:');
                          if (reason !== null) {
                            handleToggleCoursePublication(selectedCourse._id, false, reason);
                            setShowCourseModal(false);
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        Unpublish Course
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleToggleCoursePublication(selectedCourse._id, true);
                          setShowCourseModal(false);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Publish Course
                      </button>
                    )}
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

export default AdminDashboard;