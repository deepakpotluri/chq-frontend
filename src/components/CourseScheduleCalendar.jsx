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

  // Updated event types to match backend enum values
  const eventTypes = [
    { value: 'lecture', label: 'Lecture', color: '#3B82F6' },
    { value: 'test', label: 'Test/Exam', color: '#EF4444' },
    { value: 'doubt-clearing', label: 'Doubt Clearing', color: '#10B981' },
    { value: 'discussion', label: 'Discussion', color: '#F59E0B' },
    { value: 'workshop', label: 'Workshop', color: '#8B5CF6' },
    { value: 'assignment', label: 'Assignment', color: '#6B7280' }
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    if (!date || readOnly) return;
    if (!isDateInRange(date)) {
      alert('Please select a date within the course duration');
      return;
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
      recurringDays: []
    });
    setShowEventModal(true);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    
    if (onEventClick) {
      onEventClick(event);
      return;
    }
    
    if (readOnly) return;
    
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setEventForm({
      title: event.title || '',
      type: event.type || 'lecture',
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '10:00',
      subject: event.subject || '',
      faculty: event.faculty || '',
      description: event.description || '',
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
            const inRange = date ? isDateInRange(date) : true;
            const isToday = date && date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 border rounded-lg
                  ${!date ? 'invisible' : ''}
                  ${isToday ? 'bg-blue-50 border-blue-500' : 'border-gray-200'}
                  ${inRange ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-100 cursor-not-allowed opacity-50'}
                  ${!readOnly && inRange ? 'hover:border-gray-300' : ''}
                  transition-all
                `}
              >
                {date && (
                  <>
                    <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                    <div className="mt-1 space-y-1">
                      {events.slice(0, isMobileView ? 1 : 3).map((event, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => handleEventClick(event, e)}
                          className="text-[10px] sm:text-xs p-0.5 sm:p-1 rounded cursor-pointer hover:opacity-80 truncate"
                          style={{ 
                            backgroundColor: event.color || eventTypes.find(t => t.value === event.type)?.color || '#3B82F6',
                            color: 'white'
                          }}
                          title={event.title}
                        >
                          <span className="hidden sm:inline">{event.title}</span>
                          <span className="sm:hidden">{event.startTime}</span>
                        </div>
                      ))}
                      {events.length > (isMobileView ? 1 : 3) && (
                        <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
                          +{events.length - (isMobileView ? 1 : 3)} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && !readOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedEvent ? 'Edit Session' : 'Add Session'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Introduction to React"
                />
              </div>

              {/* Type */}
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
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
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
                  placeholder="e.g., Computer Science"
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Repeat weekly
                    </span>
                  </label>

                  {eventForm.isRecurring && (
                    <div className="mt-3 space-y-2">
                      <span className="text-sm text-gray-600">Select days:</span>
                      <div className="flex flex-wrap gap-2">
                        {fullDaysOfWeek.map((day, index) => (
                          <label
                            key={day}
                            className={`
                              px-3 py-1 rounded-lg cursor-pointer text-sm
                              ${eventForm.recurringDays.includes(index)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={eventForm.recurringDays.includes(index)}
                              onChange={(e) => {
                                const days = e.target.checked
                                  ? [...eventForm.recurringDays, index]
                                  : eventForm.recurringDays.filter(d => d !== index);
                                setEventForm({ ...eventForm, recurringDays: days });
                              }}
                            />
                            {day.slice(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div>
                {selectedEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEventSubmit}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
                >
                  {selectedEvent ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseScheduleCalendar;