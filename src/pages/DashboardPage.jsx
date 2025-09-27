import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import calculateAttendanceStats from '../utils/attendanceUtils';

function DashboardPage() {
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        // Load setup data and attendance logs
        const setupData = localStorage.getItem('attendanceSetup');
        const attendanceLogs = localStorage.getItem('attendanceLogs');

        if (setupData && attendanceLogs) {
          const parsedSetupData = JSON.parse(setupData);
          const parsedAttendanceLogs = JSON.parse(attendanceLogs);
          
          // Calculate attendance statistics
          const stats = calculateAttendanceStats(parsedSetupData, parsedAttendanceLogs);
          setAttendanceStats(stats);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get card styling based on attendance percentage
  const getCardStyling = (currentPercentage, requiredPercentage) => {
    if (currentPercentage >= requiredPercentage) {
      return {
        border: 'border-green-500',
        background: 'bg-green-50',
        textColor: 'text-green-800'
      };
    } else if (currentPercentage >= requiredPercentage - 5) {
      return {
        border: 'border-yellow-500',
        background: 'bg-yellow-50',
        textColor: 'text-yellow-800'
      };
    } else {
      return {
        border: 'border-red-500',
        background: 'bg-red-50',
        textColor: 'text-red-800'
      };
    }
  };

  // Prepare data for pie chart
  const getPieChartData = (subjectStats) => {
    const attended = subjectStats.classesAttended;
    const missed = subjectStats.classesHeldSoFar - subjectStats.classesAttended;
    
    return [
      { name: 'Attended', value: attended, color: '#10B981' },
      { name: 'Missed', value: missed, color: '#EF4444' }
    ];
  };

  // Prepare data for bar chart
  const getBarChartData = (subjectStats) => {
    return [
      {
        name: 'Classes',
        Attended: subjectStats.classesAttended,
        Missed: subjectStats.classesHeldSoFar - subjectStats.classesAttended,
        Total: subjectStats.classesHeldSoFar
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attendanceStats) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-400 mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
        <p className="text-gray-600 mb-6">Once you start logging attendance, your stats will appear here!</p>
        <button
          onClick={() => window.location.href = '/checklist'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Start Logging Attendance
        </button>
      </div>
    );
  }

  const { perSubjectStats, overallStats } = attendanceStats;
  const requiredPercentage = JSON.parse(localStorage.getItem('attendanceSetup'))?.semesterData?.requiredAttendance || 75;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Dashboard</h1>
        <p className="text-gray-600">Track your attendance progress across all subjects</p>
      </div>

      {/* Overall Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {overallStats.currentPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Current Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {overallStats.classesAttended}
            </div>
            <div className="text-sm text-gray-600">Classes Attended</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {overallStats.classesNeeded}
            </div>
            <div className="text-sm text-gray-600">Classes Needed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {overallStats.classesBunkable}
            </div>
            <div className="text-sm text-gray-600">Classes Bunkable</div>
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {perSubjectStats.map((subjectStats, index) => {
          const styling = getCardStyling(subjectStats.currentPercentage, requiredPercentage);
          const pieData = getPieChartData(subjectStats);
          const barData = getBarChartData(subjectStats);

          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow border-2 ${styling.border} ${styling.background} p-6`}
            >
              {/* Subject Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {subjectStats.subject}
                </h3>
                <div className={`text-3xl font-bold ${styling.textColor} mb-2`}>
                  {subjectStats.currentPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  {subjectStats.classesAttended} of {subjectStats.totalClassesInSemester} classes attended
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {subjectStats.classesNeeded}
                  </div>
                  <div className="text-xs text-gray-600">Classes Needed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {subjectStats.classesBunkable}
                  </div>
                  <div className="text-xs text-gray-600">Classes Bunkable</div>
                </div>
              </div>

              {/* Charts */}
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Bar dataKey="Attended" fill="#10B981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Missed" fill="#EF4444" radius={[2, 2, 0, 0]} />
                      <Tooltip />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress to {requiredPercentage}%</span>
                  <span>{subjectStats.currentPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      subjectStats.currentPercentage >= requiredPercentage
                        ? 'bg-green-500'
                        : subjectStats.currentPercentage >= requiredPercentage - 5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (subjectStats.currentPercentage / requiredPercentage) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {perSubjectStats.filter(s => s.currentPercentage >= requiredPercentage).length}
            </div>
            <div className="text-sm text-gray-600">Subjects Meeting Requirement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {perSubjectStats.filter(s => s.currentPercentage >= requiredPercentage - 5 && s.currentPercentage < requiredPercentage).length}
            </div>
            <div className="text-sm text-gray-600">Subjects Close to Requirement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {perSubjectStats.filter(s => s.currentPercentage < requiredPercentage - 5).length}
            </div>
            <div className="text-sm text-gray-600">Subjects Below Requirement</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;