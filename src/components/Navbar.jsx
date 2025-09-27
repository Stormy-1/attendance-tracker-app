import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const handleResetData = () => {
    // Clear all localStorage
    localStorage.clear()
    // Redirect to setup page
    navigate('/setup')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Attendance Tracker
            </h1>
          </div>
          <div className="flex items-center space-x-8">
            <Link 
              to="/setup" 
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Setup
            </Link>
            <Link 
              to="/checklist" 
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Checklist
            </Link>
            <Link 
              to="/dashboard" 
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleResetData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
