import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

function SetupPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [semesterData, setSemesterData] = useState({
    startDate: '',
    endDate: '',
    weeklyOffDays: [],
    requiredAttendance: 75,
    holidays: [],
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHolidays, setSelectedHolidays] = useState([]);

  // Load existing setup data on component mount
  useEffect(() => {
    const savedSetupData = localStorage.getItem('attendanceSetup');
    if (savedSetupData) {
      try {
        const parsedData = JSON.parse(savedSetupData);
        if (parsedData.schedules) {
          setSchedules(parsedData.schedules);
        }
        if (parsedData.semesterData) {
          setSemesterData(parsedData.semesterData);
          // Convert holiday strings back to Date objects for the picker
          if (parsedData.semesterData.holidays) {
            const holidayDates = parsedData.semesterData.holidays.map(holiday => new Date(holiday));
            setSelectedHolidays(holidayDates);
          }
        }
        setIsEditMode(true);
      } catch (error) {
        console.error('Error parsing saved setup data:', error);
      }
    }
  }, []);

  // New, more robust parsing function
  const parseScheduleText = (text) => {
    const lines = text.split('\n');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const newSchedules = [];
    const timePattern = /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/;

    const relevantLines = lines.filter(line => timePattern.test(line) && line.length > 15);

    relevantLines.forEach(line => {
        const timeMatch = line.match(timePattern);
        if (!timeMatch) return;

        const startTime = timeMatch[1];
        const subjectsRowText = line.substring(timeMatch[0].length).trim();
        const avgColWidth = Math.floor(subjectsRowText.length / 6);
        
        for (let i = 0; i < 6; i++) {
            const startIndex = i * avgColWidth;
            const endIndex = (i + 1) * avgColWidth;
            let subjectText = subjectsRowText.substring(startIndex, endIndex).trim();

            if (subjectText && subjectText.length > 2 && !subjectText.includes('BREAK') && !subjectText.includes('Community Engagement')) {
                // Clean up common OCR artifacts
                subjectText = subjectText.replace(/[|§}]/g, '').trim();

                newSchedules.push({
                    id: Date.now() + Math.random(),
                    day: days[i],
                    time: startTime,
                    subject: subjectText,
                });
            }
        }
    });
    return newSchedules;
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      
      console.log("----- RAW OCR OUTPUT -----", text);

      const parsedSchedules = parseScheduleText(text);
      setSchedules(parsedSchedules);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    },
    multiple: false,
  });

  const updateSchedule = (id, field, value) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id ? { ...schedule, [field]: value } : schedule
    ));
  };

  // Format time input and move focus to subject field
  const handleTimeKeyPress = (e, scheduleId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const timeValue = e.target.value.trim();
      let formattedTime = timeValue;
      
      // Format time based on input
      if (/^\d{1,2}$/.test(timeValue)) {
        // Single or double digit hour (e.g., '9' or '14')
        const hour = parseInt(timeValue);
        if (hour >= 0 && hour <= 23) {
          formattedTime = `${hour.toString().padStart(2, '0')}:00`;
        }
      } else if (/^\d{1,2}:\d{1,2}$/.test(timeValue)) {
        // Already in HH:MM format, just pad if needed
        const [hours, minutes] = timeValue.split(':');
        formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      
      // Update the time value
      updateSchedule(scheduleId, 'time', formattedTime);
      
      // Move focus to subject input in the same row
      const subjectInput = e.target.closest('tr').querySelector('input[placeholder="Subject Name"]');
      if (subjectInput) {
        subjectInput.focus();
      }
    }
  };

  const addScheduleRow = () => {
    setSchedules(prev => [...prev, {
      id: Date.now(),
      day: 'Monday',
      time: '09:00',
      subject: 'New Subject',
    }]);
  };

  const removeScheduleRow = (id) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  const handleWeeklyOffDayChange = (day) => {
    setSemesterData(prev => ({
      ...prev,
      weeklyOffDays: prev.weeklyOffDays.includes(day)
        ? prev.weeklyOffDays.filter(d => d !== day)
        : [...prev.weeklyOffDays, day],
    }));
  };

  const handleHolidaySelect = (dates) => {
    setSelectedHolidays(dates);
    // Convert Date objects to ISO strings for storage
    const holidayStrings = dates.map(date => date.toISOString().split('T')[0]);
    setSemesterData(prev => ({
      ...prev,
      holidays: holidayStrings,
    }));
  };

  const removeHoliday = (holidayToRemove) => {
    const updatedHolidays = selectedHolidays.filter(holiday => 
      holiday.toISOString().split('T')[0] !== holidayToRemove
    );
    setSelectedHolidays(updatedHolidays);
    setSemesterData(prev => ({
      ...prev,
      holidays: updatedHolidays.map(date => date.toISOString().split('T')[0]),
    }));
  };

  const handleSaveAndContinue = () => {
    const setupData = {
      schedules,
      semesterData,
    };
    
    localStorage.setItem('attendanceSetup', JSON.stringify(setupData));
    navigate('/checklist');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Attendance Tracker</h1>
        <p className="text-gray-600">Configure your timetable and semester settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Timetable Upload</h2>
        
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${ isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400' }`}>
          <input {...getInputProps()} />
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Processing image with OCR...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl text-gray-400">📄</div>
              <div>
                <p className="text-lg text-gray-600">{isDragActive ? 'Drop the image here' : 'Drag & drop timetable image here'}</p>
                <p className="text-sm text-gray-500 mt-2">or click to select file</p>
              </div>
            </div>
          )}
        </div>

        {schedules.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Schedule Results</h3>
                <p className="text-sm text-gray-500 mt-1">Please use a 24-hour format for time (e.g., 14:00 for 2 PM).</p>
              </div>
              <button onClick={addScheduleRow} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">Add Row</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select value={schedule.day} onChange={(e) => updateSchedule(schedule.id, 'day', e.target.value)} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                          {daysOfWeek.map(day => (<option key={day} value={day}>{day}</option>))}
                        </select>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                         <input 
                           type="text" 
                           value={schedule.time} 
                           onChange={(e) => updateSchedule(schedule.id, 'time', e.target.value)} 
                           onKeyPress={(e) => handleTimeKeyPress(e, schedule.id)}
                           className="border border-gray-300 rounded-md px-3 py-1 text-sm w-24" 
                           placeholder="09:00" 
                         />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                         <input 
                           type="text" 
                           value={schedule.subject} 
                           onChange={(e) => updateSchedule(schedule.id, 'subject', e.target.value.toUpperCase())} 
                           className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full" 
                           placeholder="Subject Name" 
                         />
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => removeScheduleRow(schedule.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Semester Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester Start Date</label>
            <input type="date" value={semesterData.startDate} onChange={(e) => setSemesterData(prev => ({ ...prev, startDate: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester End Date</label>
            <input type="date" value={semesterData.endDate} onChange={(e) => setSemesterData(prev => ({ ...prev, endDate: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Weekly Off Days</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {daysOfWeek.map(day => (
              <label key={day} className="flex items-center">
                <input type="checkbox" checked={semesterData.weeklyOffDays.includes(day)} onChange={() => handleWeeklyOffDayChange(day)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">{day.slice(0, 3)}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Required Attendance Percentage</label>
          <input type="number" min="0" max="100" value={semesterData.requiredAttendance} onChange={(e) => setSemesterData(prev => ({ ...prev, requiredAttendance: parseInt(e.target.value) || 0 }))} className="w-32 border border-gray-300 rounded-md px-3 py-2" />
          <span className="ml-2 text-sm text-gray-500">%</span>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Holidays</label>
          <p className="text-sm text-gray-500 mb-4">Click on dates in the calendar to select holidays</p>
          
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-shrink-0">
              <DayPicker
                mode="multiple"
                selected={selectedHolidays}
                onSelect={handleHolidaySelect}
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
            
            {selectedHolidays.length > 0 && (
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Holidays ({selectedHolidays.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedHolidays
                    .sort((a, b) => a - b)
                    .map((holiday, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <span className="text-sm text-gray-700">
                          {format(holiday, 'EEEE, MMMM do, yyyy')}
                        </span>
                        <button 
                          onClick={() => removeHoliday(holiday.toISOString().split('T')[0])} 
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

       <div className="text-center py-6">
         <button onClick={handleSaveAndContinue} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium">
           {isEditMode ? 'Update Settings' : 'Save and Continue'}
         </button>
       </div>
    </div>
  );
}

export default SetupPage;