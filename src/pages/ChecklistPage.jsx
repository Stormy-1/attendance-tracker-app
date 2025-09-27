import { useState } from 'react'

function Attendance() {
  const [students] = useState([
    { id: 1, name: 'John Doe', status: 'present' },
    { id: 2, name: 'Jane Smith', status: 'absent' },
    { id: 3, name: 'Mike Johnson', status: 'present' },
    { id: 4, name: 'Sarah Wilson', status: 'present' },
    { id: 5, name: 'David Brown', status: 'absent' },
  ])

  const [attendanceStatus, setAttendanceStatus] = useState(
    students.reduce((acc, student) => {
      acc[student.id] = student.status
      return acc
    }, {})
  )

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const presentCount = Object.values(attendanceStatus).filter(status => status === 'present').length
  const absentCount = Object.values(attendanceStatus).filter(status => status === 'absent').length

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="mt-2 text-gray-600">
          Mark attendance for today's class
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Student List
              </h3>
              <div className="space-y-3">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">
                      {student.name}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          attendanceStatus[student.id] === 'present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          attendanceStatus[student.id] === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Students:</span>
                  <span className="text-sm font-medium text-gray-900">{students.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Present:</span>
                  <span className="text-sm font-medium text-green-600">{presentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Absent:</span>
                  <span className="text-sm font-medium text-red-600">{absentCount}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Attendance Rate:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Attendance
