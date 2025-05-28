import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CourseDetailPage = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [newReview, setNewReview] = useState({
    courseRating: 5,
    instituteRating: 5,
    facultyRating: 5,
    reviewText: ''
  });

  // Get course ID from URL
  const courseId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchCourseDetails();
    checkShortlistStatus();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/api/courses/${courseId}`);
      setCourse(response.data.data);
      
      // Increment view count
      await api.post(`/api/courses/${courseId}/view`);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const checkShortlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await api.get('/api/aspirant/shortlist');
      const shortlisted = response.data.courses.some(c => c.course._id === courseId);
      setIsShortlisted(shortlisted);
    } catch (err) {
      console.error('Error checking shortlist status:', err);
    }
  };

  const handleShortlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      if (isShortlisted) {
        await api.delete(`/api/aspirant/shortlist/${courseId}`);
        setIsShortlisted(false);
      } else {
        await api.post(`/api/aspirant/shortlist/${courseId}`);
        setIsShortlisted(true);
      }
    } catch (err) {
      console.error('Error updating shortlist:', err);
      alert('Failed to update shortlist. Please try again.');
    }
  };

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    try {
      const response = await api.post(`/api/aspirant/enroll/${courseId}`, {
        amount: course.discount > 0 ? course.price * (1 - course.discount / 100) : course.price
      });
      
      if (response.data.success) {
        alert('Enrollment successful! You will receive course access details via email.');
        setShowEnrollModal(false);
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll. Please try again.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      await api.post(`/api/courses/${courseId}/reviews`, newReview);
      alert('Review submitted successfully!');
      setReviewFormVisible(false);
      fetchCourseDetails(); // Refresh to show new review
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleReviewVote = async (reviewId, voteType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to vote on reviews');
        return;
      }

      await api.post(`/api/courses/${courseId}/reviews/${reviewId}/vote`, {
        vote: voteType
      });
      
      fetchCourseDetails();
    } catch (err) {
      console.error('Error voting on review:', err);
      alert('Failed to vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
          {error || 'Course not found'}
          <div className="mt-4">
            <a href="/courses" className="text-blue-600 hover:underline">
              Browse all courses
            </a>
          </div>
        </div>
      </div>
    );
  }

  const discountedPrice = course.discount > 0 ? Math.round(course.price * (1 - course.discount / 100)) : course.price;
  const availableSeats = course.maxStudents > 0 ? course.maxStudents - course.currentEnrollments : 'Unlimited';
  const isSeatsLimited = course.maxStudents > 0 && (course.maxStudents - course.currentEnrollments) <= 10;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 pt-24 pb-8">
          {/* Breadcrumb */}
          <nav className="text-sm mb-4">
            <ol className="flex items-center space-x-2">
              <li><a href="/" className="text-gray-600 hover:text-gray-900">Home</a></li>
              <li className="text-gray-400">/</li>
              <li><a href="/courses" className="text-gray-600 hover:text-gray-900">Courses</a></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{course.courseCategory}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  course.courseCategory === 'prelims' ? 'bg-blue-100 text-blue-800' :
                  course.courseCategory === 'mains' ? 'bg-green-100 text-green-800' :
                  course.courseCategory === 'optionals' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {course.courseCategory?.charAt(0).toUpperCase() + course.courseCategory?.slice(1)}
                </span>
                
                {course.courseType?.map((type, idx) => (
                  <span key={idx} className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                ))}

                {course.isFeatured && (
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              
              <div className="flex items-center flex-wrap gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {course.institution?.institutionName}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {course.city}, {course.state}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {course.courseLanguages?.join(', ') || course.language?.join(', ')}
                </div>
              </div>

              {/* Ratings and Stats */}
              <div className="flex items-center gap-8 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{course.averageRating?.overall?.toFixed(1) || '0.0'}</div>
                  <div className="flex items-center justify-center text-yellow-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(course.averageRating?.overall || 0) ? 'fill-current' : 'stroke-current'}`} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">{course.totalReviews} reviews</div>
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{course.currentEnrollments}</div>
                    <div className="text-xs text-gray-600">Students Enrolled</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{course.views}</div>
                    <div className="text-xs text-gray-600">Total Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{course.shortlisted}</div>
                    <div className="text-xs text-gray-600">Shortlisted</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-lg p-6 sticky top-24">
                <div className="mb-4">
                  {course.discount > 0 && (
                    <div className="text-gray-400 line-through text-lg">₹{course.originalPrice?.toLocaleString()}</div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">₹{discountedPrice.toLocaleString()}</span>
                    {course.discount > 0 && (
                      <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded font-medium">
                        {course.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Course Duration</span>
                    <span className="font-medium text-gray-900">{course.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium text-gray-900">{new Date(course.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-medium text-gray-900">{new Date(course.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Seats</span>
                    <span className={`font-medium ${isSeatsLimited ? 'text-orange-600' : 'text-gray-900'}`}>
                      {availableSeats}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Type</span>
                    <span className="font-medium text-gray-900 capitalize">{course.deliveryType}</span>
                  </div>
                </div>

                {isSeatsLimited && (
                  <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-lg mb-4">
                    ⚠️ Hurry! Only {availableSeats} seats left
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Enroll Now
                  </button>
                  
                  <button
                    onClick={handleShortlist}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition duration-200 ${
                      isShortlisted 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {isShortlisted ? '❤️ Remove from Shortlist' : '🤍 Add to Shortlist'}
                  </button>
                  
                  <button className="w-full bg-white text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg border border-gray-300 transition duration-200">
                    📞 Contact Institute
                  </button>
                </div>

                {/* Money Back Guarantee */}
                {/* <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <div className="font-medium text-green-900">7-Day Money Back Guarantee</div>
                      <div className="text-sm text-green-700 mt-1">Full refund if not satisfied</div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b">
                <nav className="flex -mb-px">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'curriculum', label: 'Curriculum' },
                    { id: 'faculty', label: 'Faculty' },
                    { id: 'schedule', label: 'Schedule' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id 
                          ? 'text-gray-900 border-gray-900' 
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
                      <div className="prose max-w-none text-gray-600">
                        <p className="whitespace-pre-line">{course.description}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.subjects?.map((subject, idx) => (
                          <div key={idx} className="flex items-start">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{subject}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Course Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Comprehensive Study Material</h4>
                            <p className="text-sm text-gray-600">Access to detailed notes, practice questions, and reference materials</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-green-100 p-3 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Expert Faculty</h4>
                            <p className="text-sm text-gray-600">Learn from experienced educators and subject matter experts</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-purple-100 p-3 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Regular Assessments</h4>
                            <p className="text-sm text-gray-600">Track your progress with regular tests and mock exams</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Doubt Resolution</h4>
                            <p className="text-sm text-gray-600">Get your queries resolved through dedicated doubt-clearing sessions</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Related Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
                      {course.syllabusFile && (
                        <a 
                          href={`/api/courses/${course._id}/syllabus`}
                          className="inline-flex items-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Syllabus
                        </a>
                      )}
                    </div>

                    {course.syllabusDetails && course.syllabusDetails.length > 0 ? (
                      <div className="space-y-4">
                        {course.syllabusDetails.map((section, idx) => (
                          <div key={idx} className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-4 flex justify-between items-center">
                              <h4 className="font-semibold text-gray-900">
                                Module {idx + 1}: {section.topic}
                              </h4>
                              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                                {section.duration}
                              </span>
                            </div>
                            <div className="p-4">
                              <ul className="space-y-2">
                                {section.subtopics.map((subtopic, subIdx) => (
                                  <li key={subIdx} className="flex items-start text-gray-700">
                                    <span className="text-gray-400 mr-2">•</span>
                                    <span className="text-sm">{subtopic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600">Detailed curriculum information not available.</p>
                        {course.syllabusFile && (
                          <p className="text-sm text-gray-500 mt-2">Please download the syllabus PDF for complete details.</p>
                        )}
                      </div>
                    )}

                    {course.modules && course.modules.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Course Content</h3>
                        {course.modules.map((module, idx) => (
                          <div key={idx} className="border rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{module.title}</h4>
                            {module.description && (
                              <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                            )}
                            <div className="space-y-2">
                              {module.contentItems?.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center">
                                    <span className="mr-2">
                                      {item.type === 'video' ? '📹' : 
                                       item.type === 'document' ? '📄' :
                                       item.type === 'quiz' ? '📝' : '📋'}
                                    </span>
                                    <span className="text-sm">{item.title}</span>
                                    {item.duration && (
                                      <span className="text-xs text-gray-500 ml-2">({item.duration})</span>
                                    )}
                                  </div>
                                  {item.isPreview && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Preview
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Faculty Tab */}
                {activeTab === 'faculty' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Expert Faculty</h2>
                    {course.faculty && course.faculty.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {course.faculty.map((member, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-start">
                              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                <span className="text-2xl text-gray-600">👨‍🏫</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{member.subject}</p>
                                {member.qualification && (
                                  <div className="mt-3">
                                    <span className="text-sm font-medium text-gray-700">Qualification:</span>
                                    <p className="text-sm text-gray-600">{member.qualification}</p>
                                  </div>
                                )}
                                {member.experience && (
                                  <div className="mt-2">
                                    <span className="text-sm font-medium text-gray-700">Experience:</span>
                                    <p className="text-sm text-gray-600">{member.experience}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <p className="text-gray-600">Faculty information will be updated soon.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Schedule</h2>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-blue-900">
                            Classes start on <strong>{new Date(course.startDate).toLocaleDateString()}</strong> and end on <strong>{new Date(course.endDate).toLocaleDateString()}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    {course.weeklySchedule && course.weeklySchedule.length > 0 ? (
                      <div className="space-y-4">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                          const daySchedule = course.weeklySchedule.find(s => s.day === day);
                          if (!daySchedule || !daySchedule.sessions || daySchedule.sessions.length === 0) return null;
                          
                          return (
                            <div key={day} className="border rounded-lg overflow-hidden">
                              <div className="bg-gray-50 p-4">
                                <h4 className="font-semibold text-gray-900 capitalize">{day}</h4>
                              </div>
                              <div className="p-4 space-y-3">
                                {daySchedule.sessions.map((session, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{session.subject}</div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {session.faculty} • {session.type}
                                      </div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {session.startTime} - {session.endTime}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <p className="text-gray-600">Detailed schedule will be shared after enrollment.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>
                      <button 
                        onClick={() => setReviewFormVisible(!reviewFormVisible)}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                      >
                        Write a Review
                      </button>
                    </div>

                    {/* Review Form */}
                    {reviewFormVisible && (
                      <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Share Your Experience</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Rating</label>
                            <select 
                              value={newReview.courseRating}
                              onChange={(e) => setNewReview({...newReview, courseRating: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              {[5,4,3,2,1].map(rating => (
                                <option key={rating} value={rating}>{rating} Stars</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Institute Rating</label>
                            <select 
                              value={newReview.instituteRating}
                              onChange={(e) => setNewReview({...newReview, instituteRating: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              {[5,4,3,2,1].map(rating => (
                                <option key={rating} value={rating}>{rating} Stars</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Faculty Rating</label>
                            <select 
                              value={newReview.facultyRating}
                              onChange={(e) => setNewReview({...newReview, facultyRating: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              {[5,4,3,2,1].map(rating => (
                                <option key={rating} value={rating}>{rating} Stars</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                          <textarea 
                            value={newReview.reviewText}
                            onChange={(e) => setNewReview({...newReview, reviewText: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            rows="4"
                            placeholder="Share your experience with this course..."
                            required
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <button 
                            type="submit"
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
                          >
                            Submit Review
                          </button>
                          <button 
                            type="button"
                            onClick={() => setReviewFormVisible(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Rating Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">{course.averageRating?.overall?.toFixed(1) || '0.0'}</div>
                          <div className="flex justify-center text-yellow-400 my-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-5 h-5 ${i < Math.round(course.averageRating?.overall || 0) ? 'fill-current' : 'stroke-current'}`} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600">Overall Rating</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{course.averageRating?.course?.toFixed(1) || '0.0'}</div>
                          <div className="text-sm text-gray-600">Course Content</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{course.averageRating?.institute?.toFixed(1) || '0.0'}</div>
                          <div className="text-sm text-gray-600">Institute</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{course.averageRating?.faculty?.toFixed(1) || '0.0'}</div>
                          <div className="text-sm text-gray-600">Faculty</div>
                        </div>
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    {course.reviews && course.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {course.reviews.map((review, idx) => (
                          <div key={idx} className="bg-white border rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h4 className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                                  {review.isVerified && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      ✓ Verified Student
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                  <span>Course: {review.courseRating}⭐</span>
                                  <span>Institute: {review.instituteRating}⭐</span>
                                  <span>Faculty: {review.facultyRating}⭐</span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-4">{review.reviewText}</p>
                            
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleReviewVote(review._id, 'helpful')}
                                className="flex items-center text-sm text-gray-600 hover:text-green-600"
                              >
                                👍 Helpful ({review.helpfulVotes || 0})
                              </button>
                              <button
                                onClick={() => handleReviewVote(review._id, 'not_helpful')}
                                className="flex items-center text-sm text-gray-600 hover:text-red-600"
                              >
                                👎 Not Helpful ({review.notHelpfulVotes || 0})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Institution Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Institution Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{course.institution?.institutionName}</h4>
                  <p className="text-sm text-gray-600 mt-1">{course.address}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">{course.institution?.email}</span>
                  </div>
                  
                  {course.institution?.isVerified && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm text-green-600 font-medium">Verified Institution</span>
                    </div>
                  )}
                </div>
                
                <a 
                  href={`/institutions/${course.institution?._id}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Institute Profile
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Related Courses */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">You May Also Like</h3>
              <div className="text-center text-gray-600 text-sm">
                Related course recommendations will appear here
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowEnrollModal(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Enrollment</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium text-gray-900">{course.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-gray-900">₹{discountedPrice.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-900">
                  By enrolling, you agree to the course terms and conditions. 
                  You will receive access details via email within 24 hours.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleEnroll}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Confirm Enrollment
                </button>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;