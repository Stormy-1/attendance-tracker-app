import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, parseISO } from 'date-fns';
import 'react-day-picker/dist/style.css';

function ChecklistPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [setupData, setSetupData] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load setup data and attendance logs on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load setup data
        const savedSetupData = localStorage.getItem('attendanceSetup');
        if (savedSetupData) {
          setSetupData(JSON.parse(savedSetupData));
        }

        // Load attendance logs
        const savedAttendanceLogs = localStorage.getItem('attendanceLogs');
        if (savedAttendanceLogs) {
          setAttendanceLogs(JSON.parse(savedAttendanceLogs));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get day of week for selected date
  const getDayOfWeek = (date) => {
    return format(date, 'EEEE');
  };

  // Check if selected date is a holiday
  const isHoliday = (date) => {
    if (!setupData?.semesterData?.holidays) return false;
    const dateString = format(date, 'yyyy-MM-dd');
    return setupData.semesterData.holidays.includes(dateString);
  };

  // Check if selected date is a weekly off-day
  const isWeeklyOffDay = (date) => {
    if (!setupData?.semesterData?.weeklyOffDays) return false;
    const dayOfWeek = getDayOfWeek(date);
    return setupData.semesterData.weeklyOffDays.includes(dayOfWeek);
  };

  // Check if selected date is a class day
  const isClassDay = (date) => {
    return !isHoliday(date) && !isWeeklyOffDay(date);
  };

  // Get subjects for the selected day
  const getSubjectsForDay = (date) => {
    if (!setupData?.schedules) return [];
    const dayOfWeek = getDayOfWeek(date);
    return setupData.schedules.filter(schedule => schedule.day === dayOfWeek);
  };

  // Get attendance status for a subject on a specific date
  const getAttendanceStatus = (date, subject) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const log = attendanceLogs.find(log => 
      log.date === dateString && log.subject === subject
    );
    return log ? log.attended : false;
  };

  // Update attendance status
  const updateAttendance = (date, subject, attended) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const newLog = { date: dateString, subject, attended };
    
    setAttendanceLogs(prev => {
      const filtered = prev.filter(log => 
        !(log.date === dateString && log.subject === subject)
      );
      const updated = [...filtered, newLog];
      
      // Save to localStorage
      localStorage.setItem('attendanceLogs', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Get attendance summary for the selected date
  const getAttendanceSummary = (date) => {
    const subjects = getSubjectsForDay(date);
    if (subjects.length === 0) return { total: 0, attended: 0, percentage: 0 };
    
    const attended = subjects.filter(subject => 
      getAttendanceStatus(date, subject.subject)
    ).length;
    
    return {
      total: subjects.length,
      attended,
      percentage: Math.round((attended / subjects.length) * 100)
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!setupData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Setup Data Found</h2>
        <p className="text-gray-600 mb-6">Please complete the setup first.</p>
        <button
          onClick={() => navigate('/setup')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Go to Setup
        </button>
      </div>
    );
  }

  const dayOfWeek = getDayOfWeek(selectedDate);
  const isClassDayToday = isClassDay(selectedDate);
  const subjects = getSubjectsForDay(selectedDate);
  const summary = getAttendanceSummary(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Checklist</h1>
        <p className="text-gray-600">Mark your attendance for each subject</p>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date</h2>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="border border-gray-300 rounded-lg p-4"
              styles={{
                day: {
                  borderRadius: '6px',
                },
                day_selected: {
                  backgroundColor: '#3B82F6',
                  color: 'white',
                },
                day_today: {
                  fontWeight: 'bold',
                  color: '#3B82F6',
                },
              }}
            />
          </div>
          
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {format(selectedDate, 'EEEE, MMMM do, yyyy')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isClassDayToday ? `${subjects.length} subjects scheduled` : 'No classes today'}
              </p>
              
              {isClassDayToday && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{summary.attended}</div>
                    <div className="text-gray-600">Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{summary.percentage}%</div>
                    <div className="text-gray-600">Rate</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isClassDayToday ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subjects for {dayOfWeek}
          </h2>
          
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((schedule, index) => {
                const isAttended = getAttendanceStatus(selectedDate, schedule.subject);
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 transition-colors ${
                      isAttended 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {schedule.subject}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {schedule.time}
                        </p>
                      </div>
                      <div className="ml-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isAttended}
                            onChange={(e) => updateAttendance(selectedDate, schedule.subject, e.target.checked)}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {isAttended ? 'Attended' : 'Mark as attended'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No subjects scheduled for this day.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl text-gray-400 mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Classes Today</h2>
            <p className="text-gray-600 mb-6">
              {isHoliday(selectedDate) 
                ? 'This date is marked as a holiday.' 
                : 'This is a weekly off-day.'}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Button */}
      <div className="text-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}

export default ChecklistPage;