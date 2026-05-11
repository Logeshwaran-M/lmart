import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-purple-600 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Go to Homepage
          </Link>
          
          <div className="flex justify-center space-x-4">
            <Link 
              to="/printing" 
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Printing Services
            </Link>
            <Link 
              to="/e-store" 
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              E-Store
            </Link>
            <Link 
              to="/local-market" 
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Local Market
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
