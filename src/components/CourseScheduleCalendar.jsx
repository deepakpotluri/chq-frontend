import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, BookOpen, X, Calendar } from 'lucide-react';

const CourseScheduleCalendar = ({ 
  initialSchedule = [], 
  onScheduleChange, 
  startDate, 
  endDate,
  readOnly = false,
  onEventClick 
}) => {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'lecture',
    startTime: '09:00',
    endTime: '10:00',
    subject: '',
    faculty: '',
    description: '',
    isRecurring: false,
    recurringDays: [],
    color: '#3B82F6'
  });

  // Add state for mobile view
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const eventTypes = [
    { value: 'lecture', label: 'Lecture', color: '#3B82F6' },
    { value: 'lab', label: 'Lab/Practical', color: '#10B981' },
    { value: 'tutorial', label: 'Tutorial', color: '#F59E0B' },
    { value: 'exam', label: 'Exam/Test', color: '#EF4444' },
    { value: 'assignment', label: 'Assignment', color: '#8B5CF6' },
    { value: 'break', label: 'Break', color: '#6B7280' }
  ];

  const daysOfWeek = isMobileView 
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
  const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (Array.isArray(initialSchedule)) {
      if (JSON.stringify(schedule) !== JSON.stringify(initialSchedule)) {
        setSchedule(initialSchedule);
      }
    }
  }, [JSON.stringify(initialSchedule)]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = formatDate(date);
    return schedule.filter(event => event.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    if (!date) return;
    
    if (readOnly) {
      const dateStr = formatDate(date);
      const dayEvents = schedule.filter(event => event.date === dateStr);
      if (dayEvents.length > 0 && onEventClick) {
        if (dayEvents.length === 1) {
          onEventClick(dayEvents[0]);
        } else {
          onEventClick(dayEvents[0]);
        }
      }
      return;
    }
    
    if (startDate && endDate) {
      const clickedDate = new Date(date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      clickedDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      if (clickedDate < start || clickedDate > end) {
        alert('Please select a date within the course duration');
        return;
      }
    }
    
    setSelectedDate(date);
    setSelectedEvent(null);
    setEventForm({
      title: '',
      type: 'lecture',
      startTime: '09:00',
      endTime: '10:00',
      subject: '',
      faculty: '',
      description: '',
      isRecurring: false,
      recurringDays: [],
      color: '#3B82F6'
    });
    setShowEventModal(true);
  };

  const handleEventClick = (event, date) => {
    if (readOnly) {
      if (onEventClick) {
        onEventClick(event);
      }
      return;
    }
    
    setSelectedDate(date);
    setSelectedEvent(event);
    setEventForm({
      ...event,
      isRecurring: false,
      recurringDays: []
    });
    setShowEventModal(true);
  };

  const handleEventSubmit = () => {
    if (!eventForm.title) {
      alert('Please enter a session title');
      return;
    }
    
    const newEvents = [];
    
    if (eventForm.isRecurring && eventForm.recurringDays.length > 0) {
      const start = new Date(startDate || currentMonth);
      const end = new Date(endDate || new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3, 0));
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        if (eventForm.recurringDays.includes(dayOfWeek)) {
          newEvents.push({
            id: Date.now() + Math.random(),
            date: formatDate(new Date(currentDate)),
            ...eventForm,
            color: eventTypes.find(t => t.value === eventForm.type)?.color || '#3B82F6'
          });
        }
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }
    } else {
      const eventData = {
        id: selectedEvent?.id || Date.now(),
        date: formatDate(selectedDate),
        ...eventForm,
        color: eventTypes.find(t => t.value === eventForm.type)?.color || '#3B82F6'
      };
      
      if (selectedEvent) {
        const updatedSchedule = schedule.map(event => 
          event.id === selectedEvent.id ? eventData : event
        );
        setSchedule(updatedSchedule);
        onScheduleChange?.(updatedSchedule);
      } else {
        newEvents.push(eventData);
      }
    }
    
    if (newEvents.length > 0) {
      const updatedSchedule = [...schedule, ...newEvents];
      setSchedule(updatedSchedule);
      onScheduleChange?.(updatedSchedule);
    }
    
    setShowEventModal(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    
    const updatedSchedule = schedule.filter(event => event.id !== selectedEvent.id);
    setSchedule(updatedSchedule);
    onScheduleChange?.(updatedSchedule);
    setShowEventModal(false);
  };

  const isDateInRange = (date) => {
    if (!date || !startDate || !endDate) return true;
    
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    d.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return d >= start && d <= end;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b gap-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span className="hidden sm:inline">Course Schedule</span>
          <span className="sm:hidden">Schedule</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button" 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className="font-medium text-gray-900 text-sm sm:text-base min-w-[120px] sm:min-w-[150px] text-center">
            {currentMonth.toLocaleDateString('en-US', { 
              month: isMobileView ? 'short' : 'long', 
              year: 'numeric' 
            })}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2 sm:p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-600 py-1 sm:py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {getDaysInMonth(currentMonth).map((date, index) => {
            const events = date ? getEventsForDate(date) : [];
            const inRange = date ? isDateInRange(date) : false;
            const isToday = date && new Date().toDateString() === date.toDateString();
            
            return (
              <div
                key={index}
                className={`
                  min-h-[60px] sm:min-h-[100px] 
                  border rounded-md sm:rounded-lg 
                  p-1 sm:p-2 
                  relative
                  ${date 
                    ? inRange
                      ? readOnly 
                        ? 'cursor-pointer hover:bg-gray-50'
                        : 'cursor-pointer hover:bg-blue-50'
                      : 'bg-gray-100 cursor-not-allowed'
                    : ''
                  }
                  ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                `}
                onClick={() => date && inRange && handleDateClick(date)}
              >
                {date && (
                  <div className="h-full flex flex-col">
                    <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {date.getDate()}
                    </div>
                    <div className="flex-1 overflow-hidden mt-1">
                      {/* Mobile view - show dots for events */}
                      {isMobileView ? (
                        <div className="flex gap-1 flex-wrap">
                          {events.slice(0, 3).map((event, idx) => (
                            <div
                              key={idx}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: event.color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event, date);
                              }}
                            />
                          ))}
                          {events.length > 3 && (
                            <div className="text-xs text-gray-500">+{events.length - 3}</div>
                          )}
                        </div>
                      ) : (
                        /* Desktop view - show event titles */
                        <>
                          {events.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-1 rounded truncate mb-1 ${
                                readOnly ? 'hover:bg-opacity-80' : 'hover:bg-opacity-80 cursor-pointer'
                              }`}
                              style={{ backgroundColor: event.color, color: 'white' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event, date);
                              }}
                            >
                              {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{events.length - 2} more
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && !readOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedEvent ? 'Edit Session' : 'Add New Session'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Session Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter session title"
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={eventForm.subject}
                  onChange={(e) => setEventForm({ ...eventForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mathematics"
                />
              </div>

              {/* Faculty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty
                </label>
                <input
                  type="text"
                  value={eventForm.faculty}
                  onChange={(e) => setEventForm({ ...eventForm, faculty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Faculty name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>

              {/* Recurring Option */}
              {!selectedEvent && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={eventForm.isRecurring}
                      onChange={(e) => setEventForm({ 
                        ...eventForm, 
                        isRecurring: e.target.checked,
                        recurringDays: []
                      })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Repeat this session weekly
                    </span>
                  </label>

                  {eventForm.isRecurring && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat on
                      </label>
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        {fullDaysOfWeek.map((day, index) => (
                          <label key={day} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={eventForm.recurringDays.includes(index)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEventForm({
                                    ...eventForm,
                                    recurringDays: [...eventForm.recurringDays, index]
                                  });
                                } else {
                                  setEventForm({
                                    ...eventForm,
                                    recurringDays: eventForm.recurringDays.filter(d => d !== index)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{isMobileView ? day.slice(0, 3) : day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleEventSubmit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition order-1 sm:order-1"
              >
                {selectedEvent ? 'Update Session' : 'Add Session'}
              </button>
              {selectedEvent && (
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition order-3 sm:order-2"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition order-2 sm:order-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseScheduleCalendar;