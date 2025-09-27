function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Attendance Tracker
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Track attendance efficiently with our modern React application
          </p>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Features
              </h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Modern React with Vite</li>
                <li>• Tailwind CSS for styling</li>
                <li>• React Router for navigation</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
