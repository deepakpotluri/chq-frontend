import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AspirantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [shortlistedCourses, setShortlistedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [pastEnrollments, setPastEnrollments] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check authentication
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'aspirant') {
    window.location.href = '/login';
    return null;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile
      const profileResponse = await api.get('/api/aspirant/profile');
      setUserData(profileResponse.data);

      // Fetch shortlisted courses
      const shortlistResponse = await api.get('/api/aspirant/shortlist');
      setShortlistedCourses(shortlistResponse.data.courses || []);

      // Fetch enrolled courses
      const enrolledResponse = await api.get('/api/aspirant/enrolled');
      setEnrolledCourses(enrolledResponse.data.courses || []);

      // Fetch past enrollments
      const pastResponse = await api.get('/api/aspirant/past-enrollments');
      setPastEnrollments(pastResponse.data.courses || []);

      // Fetch my reviews
      const reviewsResponse = await api.get('/api/aspirant/reviews');
      setMyReviews(reviewsResponse.data.reviews || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');

    } finally {
      setLoading(false);
    }
  };

  const removeFromShortlist = async (courseId) => {
    try {
      await api.delete(`/api/aspirant/shortlist/${courseId}`);
      setShortlistedCourses(shortlistedCourses.filter(item => item.course._id !== courseId));
    } catch (err) {
      console.error('Error removing from shortlist:', err);
      alert('Failed to remove from shortlist');
    }
  };

  const updateShortlistNotes = async (courseId, notes) => {
    try {
      await api.put(`/api/aspirant/shortlist/${courseId}/notes`, { notes });
      setShortlistedCourses(shortlistedCourses.map(item => 
        item.course._id === courseId ? { ...item, notes } : item
      ));
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update notes');
    }
  };

  const CourseCard = ({ course, isShortlisted = false, isEnrolled = false, shortlistItem = null, enrollmentItem = null }) => {
    const [notes, setNotes] = useState(shortlistItem?.notes || '');
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const discountedPrice = course.discount > 0 ? Math.round(course.price * (1 - course.discount / 100)) : course.price;

    const handleNotesUpdate = () => {
      if (isShortlisted) {
        updateShortlistNotes(course._id, notes);
        setIsEditingNotes(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                course.courseCategory === 'prelims' ? 'bg-blue-100 text-blue-800' :
                course.courseCategory === 'mains' ? 'bg-green-100 text-green-800' :
                course.courseCategory === 'optionals' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {course.courseCategory?.charAt(0).toUpperCase() + course.courseCategory?.slice(1)}
              </span>
              
              {isEnrolled && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  ✓ Enrolled
                </span>
              )}
            </div>
            
            {isShortlisted && (
              <button
                onClick={() => removeFromShortlist(course._id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ❌
              </button>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
          
          <div className="flex items-center mb-3">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm ml-1">{course.averageRating?.overall?.toFixed(1) || 'New'}</span>
            <span className="text-gray-500 text-sm ml-1">({course.totalReviews || 0})</span>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            <div>📍 {course.city}</div>
            <div>⏱️ {course.duration}</div>
            <div>🏢 {course.institution?.institutionName}</div>
            {course.startDate && (
              <div>📅 Starts: {new Date(course.startDate).toLocaleDateString()}</div>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {course.discount > 0 && (
                <span className="text-gray-400 line-through text-sm">₹{course.originalPrice?.toLocaleString()}</span>
              )}
              <span className="text-lg font-bold">₹{discountedPrice.toLocaleString()}</span>
              {course.discount > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {course.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Enrollment specific info */}
          {isEnrolled && enrollmentItem && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm">{enrollmentItem.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${enrollmentItem.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Enrolled: {new Date(enrollmentItem.enrolledAt).toLocaleDateString()}</span>
                <span>👥 {enrollmentItem.batchmates} classmates</span>
              </div>
            </div>
          )}

          {/* Shortlist notes */}
          {isShortlisted && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">My Notes:</span>
                <button
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {isEditingNotes ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Add your notes about this course..."
                  />
                  <button
                    onClick={handleNotesUpdate}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {notes || 'No notes added yet'}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <a
              href={`/courses/${course._id}`}
              className="flex-1 text-center bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded transition duration-200"
            >
              View Details
            </a>
            
            {isEnrolled && (
              <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition duration-200">
                Continue Learning
              </button>
            )}
          </div>
        </div>
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
    <div className="container mx-auto px-4 pt-20 pb-10">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
              {userData && (
                <div className="mt-2">
                  <p className="text-gray-600">Welcome back, {userData.name}!</p>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">{userData && new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 mx-6 mt-6 rounded">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Overview', icon: '📊' },
              { id: 'shortlist', label: 'My Shortlist', icon: '❤️', count: shortlistedCourses.length },
              { id: 'enrolled', label: 'Enrolled Courses', icon: '📚', count: enrolledCourses.length },
              { id: 'past', label: 'Past Courses', icon: '🏆', count: pastEnrollments.length },
              { id: 'reviews', label: 'My Reviews', icon: '⭐', count: myReviews.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.label} {tab.count !== undefined && (
                  <span className="ml-1 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-600">Shortlisted Courses</h3>
                      <p className="text-2xl font-bold text-blue-900">{shortlistedCourses.length}</p>
                    </div>
                    <div className="text-2xl">❤️</div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-green-600">Active Courses</h3>
                      <p className="text-2xl font-bold text-green-900">{enrolledCourses.length}</p>
                    </div>
                    <div className="text-2xl">📚</div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-purple-600">Completed Courses</h3>
                      <p className="text-2xl font-bold text-purple-900">{pastEnrollments.length}</p>
                    </div>
                    <div className="text-2xl">🏆</div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-yellow-600">Reviews Written</h3>
                      <p className="text-2xl font-bold text-yellow-900">{myReviews.length}</p>
                    </div>
                    <div className="text-2xl">⭐</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="/courses"
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 text-center"
                  >
                    <div className="text-2xl mb-2">🔍</div>
                    <h3 className="font-medium">Browse Courses</h3>
                    <p className="text-sm text-gray-600">Find new courses to enhance your preparation</p>
                  </a>

                  <button
                    onClick={() => setActiveTab('shortlist')}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 text-center"
                  >
                    <div className="text-2xl mb-2">❤️</div>
                    <h3 className="font-medium">View Shortlist</h3>
                    <p className="text-sm text-gray-600">Check your saved courses</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('enrolled')}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 text-center"
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <h3 className="font-medium">Continue Learning</h3>
                    <p className="text-sm text-gray-600">Resume your enrolled courses</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {shortlistedCourses.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg mr-3">❤️</div>
                      <div className="flex-1">
                        <p className="font-medium">{item.course.title}</p>
                        <p className="text-sm text-gray-600">
                          Added to shortlist on {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {enrolledCourses.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg mr-3">📚</div>
                      <div className="flex-1">
                        <p className="font-medium">{item.course.title}</p>
                        <p className="text-sm text-gray-600">
                          Enrolled on {new Date(item.enrolledAt).toLocaleDateString()} • {item.progress}% complete
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shortlist Tab */}
          {activeTab === 'shortlist' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Shortlisted Courses</h2>
                <a
                  href="/courses"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Browse More Courses
                </a>
              </div>

              {shortlistedCourses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">❤️</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No courses shortlisted yet</h3>
                  <p className="text-gray-600 mb-4">Start browsing courses and add them to your shortlist for easy comparison</p>
                  <a
                    href="/courses"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Browse Courses
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shortlistedCourses.map((item) => (
                    <CourseCard 
                      key={item._id}
                      course={item.course}
                      isShortlisted={true}
                      shortlistItem={item}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Enrolled Courses Tab */}
          {activeTab === 'enrolled' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Enrolled Courses</h2>
                <div className="text-sm text-gray-600">
                  {enrolledCourses.length} active course{enrolledCourses.length !== 1 ? 's' : ''}
                </div>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No enrolled courses yet</h3>
                  <p className="text-gray-600 mb-4">Enroll in courses to start your UPSC preparation journey</p>
                  <a
                    href="/courses"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    Find Courses
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Course Progress Overview */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Overall Progress</h3>
                    <div className="space-y-2">
                      {enrolledCourses.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.course.title}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{item.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((item) => (
                      <CourseCard 
                        key={item._id}
                        course={item.course}
                        isEnrolled={true}
                        enrollmentItem={item}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Past Courses Tab */}
          {activeTab === 'past' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Past Enrollments</h2>
                <div className="text-sm text-gray-600">
                  {pastEnrollments.length} completed course{pastEnrollments.length !== 1 ? 's' : ''}
                </div>
              </div>

              {pastEnrollments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No completed courses yet</h3>
                  <p className="text-gray-600">Your completed courses will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEnrollments.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md border">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✓ Completed
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{item.course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          🏢 {item.course.institution?.institutionName}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <div className="text-green-600 font-medium">100% Complete</div>
                            <div className="text-gray-600">Certificate earned</div>
                          </div>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-200">
                            Write Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Reviews</h2>
                <div className="text-sm text-gray-600">
                  {myReviews.length} review{myReviews.length !== 1 ? 's' : ''} written
                </div>
              </div>

              {myReviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No reviews written yet</h3>
                  <p className="text-gray-600">Share your experience by reviewing courses you've taken</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {myReviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-lg shadow-md border p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{review.course.title}</h3>
                          <p className="text-sm text-gray-600">{review.course.institution?.institutionName}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <span className="mr-2">Course: {review.courseRating}⭐</span>
                            <span className="mr-2">Institute: {review.instituteRating}⭐</span>
                            <span>Faculty: {review.facultyRating}⭐</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{review.reviewText}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {review.isVerified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              ✓ Verified Review
                            </span>
                          )}
                          <span className="text-sm text-gray-600">
                            👍 {review.helpfulVotes} found helpful
                          </span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AspirantDashboard;