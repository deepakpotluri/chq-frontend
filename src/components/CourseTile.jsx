// src/components/CourseTile.jsx - Reusable component for displaying courses
import React from 'react';
import { Link } from 'react-router-dom';

const CourseTile = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.isArray(course.courseType) ? (
            course.courseType.map((type, idx) => (
              <span key={idx} className={`px-2 py-1 text-xs rounded-full ${
                type === 'online' ? 'bg-blue-100 text-blue-800' :
                type === 'offline' ? 'bg-green-100 text-green-800' : 
                type === 'hybrid' ? 'bg-purple-100 text-purple-800' :
                type === 'weekend' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {course.courseType || 'Online'}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex justify-between items-center border-t pt-4">
          <div>
            <p className="text-gray-600 text-sm">By: {course.institution?.institutionName || 'Unknown Institution'}</p>
            <p className="text-gray-700 font-medium mt-1">₹{course.price}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">{course.duration}</span>
            <Link
              to={`/courses/${course._id}`}
              className="mt-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded transition duration-200"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseTile;