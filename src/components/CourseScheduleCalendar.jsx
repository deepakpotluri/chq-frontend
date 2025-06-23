import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Users, BookOpen, Edit2, Trash2 } from 'lucide-react';

const CourseScheduleCalendar = ({ 
  initialSchedule = [], 
  onScheduleChange, 
  startDate, 
  endDate,
  readOnly = false,
  onEventClick
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const eventTypes = [
    { value: 'lecture', label: 'Lecture', color: '#3B82F6' },
    { value: 'test', label: 'Test/Exam', color: '#EF4444' },
    { value: 'doubt-clearing', label: 'Doubt Clearing', color: '#10B981' },
    { value: 'discussion', label: 'Discussion', color: '#F59E0B' },
    { value: 'workshop', label: 'Workshop', color: '#8B5CF6' },
    { value: 'assignment', label: 'Assignment Due', color: '#EC4899' }
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (initialSchedule && Array.isArray(initialSchedule)) {
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
      
      // Set times to compare dates only
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
      // Create recurring events
      const start = new Date(startDate || currentMonth);
      const end = new Date(endDate || new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3, 0));
      
      // Set to beginning of day to avoid time issues
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      // Iterate through each day in the range
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        if (eventForm.recurringDays.includes(dayOfWeek)) {
          // Create a new date object for this specific event
          newEvents.push({
            id: Date.now() + Math.random(),
            date: formatDate(new Date(currentDate)),
            ...eventForm,
            color: eventTypes.find(t => t.value === eventForm.type)?.color || '#3B82F6'
          });
        }
        // Move to next day by creating a new date
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }
    } else {
      // Create single event
      const eventData = {
        id: selectedEvent?.id || Date.now(),
        date: formatDate(selectedDate),
        ...eventForm,
        color: eventTypes.find(t => t.value === eventForm.type)?.color || '#3B82F6'
      };
      
      if (selectedEvent) {
        // Update existing event
        const updatedSchedule = schedule.map(event => 
          event.id === selectedEvent.id ? eventData : event
        );
        setSchedule(updatedSchedule);
        onScheduleChange?.(updatedSchedule);
      } else {
        // Add new event
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
    
    // Create new date objects to avoid mutation
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set time to start of day for accurate date comparison
    d.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999); // End of day for end date
    
    return d >= start && d <= end;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Course Schedule</h3>
        <div className="flex items-center gap-2">
          <button
            type="button" 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-gray-900 min-w-[150px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(currentMonth).map((date, index) => {
            const events = date ? getEventsForDate(date) : [];
            const inRange = date ? isDateInRange(date) : false;
            
            return (
              <div
                key={index}
                className={`min-h-[100px] border rounded-lg p-2 ${
                  date 
                    ? inRange
                      ? readOnly 
                        ? 'cursor-pointer hover:bg-gray-50'
                        : 'cursor-pointer hover:bg-blue-50'
                      : 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                onClick={() => date && inRange && handleDateClick(date)}
              >
                {date && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-700">
                      {date.getDate()}
                    </div>
                    {events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded truncate ${
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
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
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

            <div className="space-y-4">
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
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={eventForm.subject}
                  onChange={(e) => setEventForm({ ...eventForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subject"
                />
              </div>

              {/* Faculty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty (Optional)
                </label>
                <input
                  type="text"
                  value={eventForm.faculty}
                  onChange={(e) => setEventForm({ ...eventForm, faculty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter faculty name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter description"
                />
              </div>

              {/* Recurring Option - Only for new events */}
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
                      Make this a recurring session
                    </span>
                  </label>
                  
                  {eventForm.isRecurring && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat on
                      </label>
                      <div className="flex flex-wrap gap-2">
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
                            <span className="text-sm">{day.slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleEventSubmit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {selectedEvent ? 'Update Session' : 'Add Session'}
              </button>
              {selectedEvent && (
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
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