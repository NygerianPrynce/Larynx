import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Home, RefreshCw, ArrowLeft, Search, Lock, Server } from 'lucide-react'

const ErrorPage = ({ 
  errorCode = '404', 
  title = 'Page Not Found', 
  message = "The page you're looking for doesn't exist or has been moved.",
  showBackButton = true,
  showHomeButton = true,
  showRefreshButton = false
}) => {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const getErrorIcon = () => {
    switch (errorCode) {
      case '404':
        return <Search className="w-16 h-16" />
      case '500':
        return <Server className="w-16 h-16" />
      case '403':
        return <Lock className="w-16 h-16" />
      default:
        return <AlertTriangle className="w-16 h-16" />
    }
  }

  const getErrorColor = () => {
    switch (errorCode) {
      case '404':
        return 'from-blue-500 to-blue-600'
      case '500':
        return 'from-red-500 to-red-600'
      case '403':
        return 'from-yellow-500 to-yellow-600'
      default:
        return 'from-purple-500 to-purple-600'
    }
  }

  const getErrorBgColor = () => {
    switch (errorCode) {
      case '404':
        return 'bg-blue-50 border-blue-200'
      case '500':
        return 'bg-red-50 border-red-200'
      case '403':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-purple-50 border-purple-200'
    }
  }

  return (
    <div 
      className="min-h-screen bg-white flex items-center justify-center px-4 pt-16"
      style={{ width: '100vw', maxWidth: '100%' }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Error Code */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r ${getErrorColor()} rounded-3xl mb-6 shadow-lg`}>
            <div className="text-white">
              {getErrorIcon()}
            </div>
          </div>
          <h1 className="text-8xl md:text-9xl font-bold text-gray-200 mb-4">
            {errorCode}
          </h1>
        </motion.div>

        {/* Title */}
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          variants={itemVariants}
        >
          {title}
        </motion.h2>

        {/* Message */}
        <motion.p 
          className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed"
          variants={itemVariants}
        >
          {message}
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          variants={itemVariants}
        >
          {showHomeButton && (
            <motion.button
              onClick={handleGoHome}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home size={20} />
              <span>Go Home</span>
            </motion.button>
          )}

          {showBackButton && (
            <motion.button
              onClick={handleGoBack}
              className="flex items-center justify-center space-x-2 px-8 py-4 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              <span>Go Back</span>
            </motion.button>
          )}

          {showRefreshButton && (
            <motion.button
              onClick={handleRefresh}
              className="flex items-center justify-center space-x-2 px-8 py-4 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} />
              <span>Try Again</span>
            </motion.button>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div 
          className={`${getErrorBgColor()} border rounded-2xl p-6 max-w-lg mx-auto`}
          variants={itemVariants}
        >
          <h3 className="font-semibold text-gray-900 mb-3">
            Need Help?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {errorCode === '404' && "The page you're looking for might have been moved or deleted."}
            {errorCode === '500' && "We're experiencing technical difficulties. Please try again later."}
            {errorCode === '403' && "You don't have the necessary permissions to access this resource."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="mailto:larynxai.official@gmail.com" 
              className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              Contact Support
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a 
              href="/" 
              className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              Return to Home
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-12"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-400">
            Powered by Larynx AI
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Pre-configured error components for common scenarios
export const Error404 = () => (
  <ErrorPage 
    errorCode="404"
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
  />
)

export const Error500 = () => (
  <ErrorPage 
    errorCode="500"
    title="Server Error"
    message="Something went wrong on our end. We're working to fix it."
    showRefreshButton={true}
    showBackButton={false}
  />
)

export const Error403 = () => (
  <ErrorPage 
    errorCode="403"
    title="Access Denied"
    message="You don't have permission to access this page."
    showRefreshButton={false}
  />
)

export default ErrorPage