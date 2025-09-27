import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import SetupPage from './pages/SetupPage'
import ChecklistPage from './pages/ChecklistPage'
import DashboardPage from './pages/DashboardPage'

// Layout component that includes the Navbar and renders child routes
function Layout() {
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
        <Route index element={<Navigate to="/setup" replace />} />
        <Route path="setup" element={<SetupPage />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App
