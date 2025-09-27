import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // This function now holds the full reset logic
  const handleReset = () => {
    // First confirmation pop-up
    const confirm1 = window.confirm(
      'Are you sure you want to reset all data? This will erase your timetable and all attendance logs.'
    );

    if (confirm1) {
      // Second confirmation pop-up
      const confirm2 = window.confirm(
        'This action cannot be undone. Are you absolutely sure?'
      );

      if (confirm2) {
        // If both are confirmed, clear all data and navigate
        localStorage.removeItem('attendanceSetup');
        localStorage.removeItem('attendanceLogs');
        alert('All data has been reset.');
        navigate('/setup');
      }
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/checklist" className="text-xl font-bold text-gray-800">
              Attendance Tracker
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link to="/setup" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
              Setup
            </Link>
            <Link to="/checklist" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
              Checklist
            </Link>
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
              Dashboard
            </Link>
          </div>
          <div>
            {location.pathname !== '/setup' && (
              <button
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Reset Data
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;