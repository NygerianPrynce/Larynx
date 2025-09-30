import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Error404 from './ErrorPage'
import Error500 from './ErrorPage'
import Error403 from './ErrorPage'

const ErrorPagesTest = () => {
  const navigate = useNavigate()
  const [currentError, setCurrentError] = useState(null)

  const errorPages = [
    {
      code: '404',
      title: 'Page Not Found',
      description: 'When a page doesn\'t exist',
      component: <Error404 />
    },
    {
      code: '500',
      title: 'Server Error',
      description: 'When something goes wrong on our end',
      component: <Error500 />
    },
    {
      code: '403',
      title: 'Access Denied',
      description: 'When user lacks permission',
      component: <Error403 />
    }
  ]

  if (currentError) {
    return (
      <div className="relative">
        {currentError.component}
        <motion.button
          onClick={() => setCurrentError(null)}
          className="absolute top-8 left-8 flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Test Menu</span>
        </motion.button>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-white"
      style={{ width: '100vw', maxWidth: '100%' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.button 
            onClick={() => navigate('/landing')}
            className="flex items-center space-x-2 text-purple-100 hover:text-white transition-colors mb-6"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} />
            <span>Back to Landing Page</span>
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Error Pages Test
            </h1>
            <p className="text-purple-100 text-lg">
              Click any error page to see how it looks
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {errorPages.map((error, index) => (
            <motion.div
              key={error.code}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => setCurrentError(error)}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                error.code === '404' ? 'bg-blue-100' :
                error.code === '500' ? 'bg-red-100' :
                'bg-yellow-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  error.code === '404' ? 'text-blue-600' :
                  error.code === '500' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {error.code}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {error.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {error.description}
              </p>
              
              <div className="text-sm text-purple-600 font-medium">
                Click to preview →
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Instructions */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-purple-900 mb-3">
              How to Test Error Pages
            </h3>
            <div className="text-purple-700 text-sm space-y-2">
              <p>• Click any error card above to see the full error page</p>
              <p>• Navigate to <code className="bg-purple-100 px-2 py-1 rounded">/error/404</code>, <code className="bg-purple-100 px-2 py-1 rounded">/error/500</code>, or <code className="bg-purple-100 px-2 py-1 rounded">/error/403</code></p>
              <p>• Try visiting a non-existent page to see the 404 error</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ErrorPagesTest
