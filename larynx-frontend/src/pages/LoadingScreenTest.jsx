import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle } from 'lucide-react'

const LoadingScreenTest = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [authMessages, setAuthMessages] = useState([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  const authLoadingMessages = [
    'Checking authentication...',
    'Verifying your session...',
    'Loading your account...',
    'Almost ready...'
  ]

  useEffect(() => {
    // Start the animated messages
    setAuthMessages(authLoadingMessages)
    setCurrentMessageIndex(0)
    
    // Auto-stop loading after 8 seconds for demo purposes
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  // Cycle through auth messages
  useEffect(() => {
    if (authMessages.length > 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % authMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [authMessages.length])

  if (!isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Screen Test Complete!</h1>
          <p className="text-gray-600 mb-8">This is what users see after the loading screen finishes.</p>
          <button 
            onClick={() => setIsLoading(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            Test Loading Screen Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-white flex items-center justify-center z-50"
      style={{ width: '100vw', maxWidth: '100%' }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
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

      {/* Main Loading Content */}
      <motion.div 
        className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto px-6 pt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Icon */}
        <motion.div 
          className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-8"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>

        {/* Spinning Loader */}
        <motion.div 
          className="relative mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
        </motion.div>

        {/* Animated Messages */}
        <div className="h-12 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            {authMessages.length > 0 && (
              <motion.p 
                key={currentMessageIndex}
                className="text-lg font-medium text-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {authMessages[currentMessageIndex]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-2 mb-8">
          {authLoadingMessages.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentMessageIndex 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                  : 'bg-gray-300'
              }`}
              animate={{
                scale: index === currentMessageIndex ? [1, 1.2, 1] : 1
              }}
              transition={{
                duration: 0.5,
                repeat: index === currentMessageIndex ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Security Badge */}
        <motion.div 
          className="flex items-center space-x-2 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Secure connection</span>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-sm text-gray-400">
          Powered by Larynx AI
        </p>
      </motion.div>
    </div>
  )
}

export default LoadingScreenTest
