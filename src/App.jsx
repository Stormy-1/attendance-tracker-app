import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import SetupPage from './pages/SetupPage'
import ChecklistPage from './pages/ChecklistPage'
import DashboardPage from './pages/DashboardPage'

// Layout component that includes the Navbar and renders child routes
function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only run smart routing on initial load (when on root path)
    if (location.pathname === '/') {
      const attendanceSetup = localStorage.getItem('attendanceSetup')
      
      if (attendanceSetup) {
        // Data exists, navigate to checklist
        navigate('/checklist', { replace: true })
      } else {
        // No data, navigate to setup
        navigate('/setup', { replace: true })
      }
    }
  }, [navigate, location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<div>Loading...</div>} />
        <Route path="setup" element={<SetupPage />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App
