// File: pages/HomeModern.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import logoImage from '../assets/logo.png' // Import your custom logo

// Import error pages
import { Error500 } from './ErrorPage'

// Custom SVG Icons
const ArrowRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

const Mail = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Zap = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const Package = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const Settings = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const HomeModern = () => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userName, setUserName] = useState('Alex')
  const [emailStats, setEmailStats] = useState({
    thisWeek: 47,
    totalDrafts: 12,
    hoursSaved: '8.5 hours'
  })
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'email',
      message: 'AI generated draft for client inquiry',
      time: '2 hours ago',
      status: 'draft'
    },
    {
      id: 2,
      type: 'inventory',
      message: 'Updated product catalog',
      time: '5 hours ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'email',
      message: 'Sent follow-up email to customer',
      time: '1 day ago',
      status: 'sent'
    }
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Error handler function
  const handleError = (error, context = '') => {
    console.error(`Error in ${context}:`, error)
    
    // Check if it's a network error or API is down
    if (!navigator.onLine || error.name === 'NetworkError') {
      setHasError(true)
      return
    }
    
    // Check specific error types
    if (error.status === 500 || error.message?.includes('500')) {
      navigate('/error/500')
    } else if (error.status === 403 || error.message?.includes('403')) {
      navigate('/error/403')
    } else {
      // For other errors, show error state
      setHasError(true)
    }
  }

  // Enhanced API call with error handling
  const fetchWithErrorHandling = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        credentials: 'include',
        ...options
      })
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`
        }
      }
      
      return await response.json()
    } catch (error) {
      throw {
        ...error,
        status: error.status || 500,
        name: error.name || 'FetchError'
      }
    }
  }

  // Helper functions for activity categorization (same as analytics page)
  const getActivityType = (activityType) => {
    if (activityType === 'email_draft') return 'email'
    if (activityType.startsWith('inventory_')) return 'inventory'
    return 'other'  // This includes special_instructions and anything else
  }

  const getActivityStatus = (activityType) => {
    if (activityType === 'email_draft') return 'draft'
    if (activityType.startsWith('inventory_')) return 'success'
    return 'info'  // special_instructions and other activities
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'email': return <Mail />
      case 'inventory': return <Package />
      default: return <Zap />
    }
  }

  // Helper function to format timestamps
  const formatTimeAgo = (timestamp) => {
    try {
      const now = new Date()
      const time = new Date(timestamp)
      const diffInMinutes = Math.floor((now - time) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'just now'
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
      
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } catch (error) {
      return 'recently'
    }
  }

  useEffect(() => {
    let isMounted = true

    // Fetch user name with error handling
    const fetchUserName = async () => {
      try {
        const data = await fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/user/name`)
        if (isMounted) {
          setUserName(data.name || 'there')
        }
      } catch (error) {
        handleError(error, 'fetchUserName')
      }
    }

    // Fetch analytics data with error handling
    const fetchAnalytics = async () => {
      try {
        const data = await fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/analytics`)
        if (isMounted) {
          // Update email stats
          setEmailStats({
            thisWeek: data.drafts_this_week || 0,
            totalDrafts: data.total_drafts || 0,
            hoursSaved: data.estimated_hours_saved ? `${data.estimated_hours_saved} hours` : '0 hours'
          })
          
          // Process recent activity with proper formatting using the new categorization
          if (data.recent_activity && Array.isArray(data.recent_activity)) {
            const formattedActivity = data.recent_activity
              .slice(0, 3) // Limit to 3 most recent items
              .map((activity, index) => ({
                id: index,
                type: getActivityType(activity.type),
                message: activity.message || 'Unknown activity',
                time: formatTimeAgo(activity.timestamp),
                status: getActivityStatus(activity.type),
                originalType: activity.type
              }))
            setRecentActivity(formattedActivity)
          } else {
            setRecentActivity([])
          }
        }
      } catch (error) {
        handleError(error, 'fetchAnalytics')
        // Set fallback data
        if (isMounted) {
          setRecentActivity([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    // Initialize data fetching
    fetchUserName()
    fetchAnalytics()

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Cleanup function
    return () => {
      clearInterval(timer)
      isMounted = false
    }
  }, [])

  // If there's an error, show the error page
  if (hasError) {
    return <Error500 />
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-40">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Manage Offerings',
      description: 'Update your products and services',
      icon: <Package />,
      color: '#8b5cf6',
      action: () => navigate('/manage-inventory')
    },
    {
      title: 'Email Settings',
      description: 'Customize your AI email preferences',
      icon: <Settings />,
      color: '#3b82f6',
      action: () => navigate('/settings')
    },
    {
      title: 'Email Analytics',
      description: 'View your email performance metrics',
      icon: <Zap />,
      color: '#06b6d4',
      action: () => navigate('/analytics')
    }
  ]

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <Navbar />
      
      {/* Header */}
      <motion.div
        className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full mx-auto text-center px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'min(95vw, 1400px)' }}>
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img 
              src={logoImage}
              alt="Larynx AI Logo"
              className="w-20 h-20 rounded-xl object-contain"
            />
          </motion.div>
          
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {getGreeting()}, {userName}!
          </motion.h1>
          
          <motion.p
            className="text-gray-600 text-lg sm:text-xl mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Larynx AI is ready to help you craft perfect messages
          </motion.p>
          
          <motion.div
            className="w-24 h-1 bg-amethyst-500 mx-auto rounded-full"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="w-full mx-auto p-4 sm:p-6 lg:p-8"
        style={{ maxWidth: 'min(95vw, 1400px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-500 mb-2">{emailStats.thisWeek}</div>
            <div className="text-sm text-gray-600">Drafts This Week</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl font-bold text-amethyst-500 mb-2">{emailStats.totalDrafts}</div>
            <div className="text-sm text-gray-600">Total Emails Drafted</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-500 mb-2">{emailStats.hoursSaved}</div>
            <div className="text-sm text-gray-600">Hours Saved</div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div style={{ color: action.color }} className="text-2xl">
                    {action.icon}
                  </div>
                  <ArrowRight />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 shadow-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-amethyst-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading activity...</span>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.message}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'sent' ? 'bg-green-100 text-green-800' :
                      activity.status === 'success' ? 'bg-purple-100 text-purple-800' :
                      activity.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity yet. Start using Larynx AI to see your activity here!</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default HomeModern
