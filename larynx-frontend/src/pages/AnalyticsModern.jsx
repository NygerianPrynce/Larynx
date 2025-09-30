import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { 
  BarChart3, 
  Clock, 
  Calendar,
  Filter,
  Download,
  Eye,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react'

const AnalyticsModern = () => {
  // Empty initial state - data will be fetched from API
  const [analyticsData, setAnalyticsData] = useState({
    draftsThisWeek: 0,
    totalDrafts: 0,
    hoursSaved: 0,
    topCategories: [],
    recentActivity: []
  })

  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [activityTypeFilter, setActivityTypeFilter] = useState('All')
  const [activityTimeFilter, setActivityTimeFilter] = useState('All Time')

  const showNotification = (message, type = 'info', duration = 4000) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
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

  const handleExportData = async () => {
    try {
      // Import XLSX library dynamically
      const XLSX = await import('xlsx')
      
      // Prepare data for export
      const exportData = {
        summary: {
          draftsThisWeek: analyticsData.draftsThisWeek,
          totalDrafts: analyticsData.totalDrafts,
          hoursSaved: analyticsData.hoursSaved,
          exportDate: new Date().toLocaleDateString()
        },
        categories: analyticsData.topCategories,
        recentActivity: analyticsData.recentActivity
      }
      
      // Create workbook
      const workbook = XLSX.utils.book_new()
      
      // Summary sheet
      const summaryData = [
        ['Metric', 'Value'],
        ['Drafts This Week', exportData.summary.draftsThisWeek],
        ['Total Drafts', exportData.summary.totalDrafts],
        ['Hours Saved', exportData.summary.hoursSaved],
        ['Export Date', exportData.summary.exportDate]
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
      
      // Categories sheet
      if (exportData.categories.length > 0) {
        const categoriesData = [
          ['Category', 'Inquiry Count'],
          ...exportData.categories.map(cat => [cat.name, cat.count])
        ]
        const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData)
        XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Top Categories')
      }
      
      // Recent activity sheet
      if (exportData.recentActivity.length > 0) {
        const activityData = [
          ['Type', 'Message', 'Time'],
          ...exportData.recentActivity.map(activity => [activity.type, activity.message, activity.time])
        ]
        const activitySheet = XLSX.utils.aoa_to_sheet(activityData)
        XLSX.utils.book_append_sheet(workbook, activitySheet, 'Recent Activity')
      }
      
      // Generate and download file
      XLSX.writeFile(workbook, `larynx-analytics-${new Date().toISOString().split('T')[0]}.xlsx`)
      
    } catch (error) {
      console.error('Error exporting data:', error)
      showNotification('Failed to export data. Please try again.', 'error')
    }
  }

  // Fetch real analytics data
  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      console.log('Fetching analytics from:', `${import.meta.env.VITE_API_URL}/analytics`)
      const [analyticsData, categoriesResult] = await Promise.all([
        fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/analytics`),
        fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/analytics/categories`)
      ])
      
      console.log('Analytics data received:', analyticsData)
      const categoriesData = categoriesResult.categories || []
      console.log('Categories data received:', categoriesData)
      
      setAnalyticsData(prev => ({
        ...prev,
        draftsThisWeek: analyticsData.drafts_this_week || 0,
        totalDrafts: analyticsData.total_drafts || 0,
        hoursSaved: analyticsData.estimated_hours_saved || 0,
        topCategories: (() => {
          // Handle empty categories data
          if (!categoriesData || categoriesData.length === 0) {
            return [];
          }
          
          const sortedCategories = categoriesData
            .filter(cat => cat.category && cat.inquiry_count > 0) // Filter out empty/null categories
            .map(cat => ({
              name: cat.category,
              count: cat.inquiry_count
            }))
            .sort((a, b) => b.count - a.count);
          
          // If no categories with inquiries, return empty array
          if (sortedCategories.length === 0) {
            return [];
          }
          
          const top8 = sortedCategories.slice(0, 8);
          const others = sortedCategories.slice(8);
          
          // If there are categories beyond top 8, group them as "Other"
          if (others.length > 0) {
            const otherCount = others.reduce((sum, cat) => sum + cat.count, 0);
            if (otherCount > 0) {
              top8.push({
                name: 'Other',
                count: otherCount
              });
            }
          }
          
          return top8;
        })(),
        recentActivity: analyticsData.formatted_recent_activity || prev.recentActivity
      }))
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Keep empty data if API fails - don't show mock data
      setAnalyticsData(prev => ({
        ...prev,
        draftsThisWeek: 0,
        totalDrafts: 0,
        hoursSaved: 0,
        topCategories: [],
        recentActivity: []
      }))
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchAnalytics()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.2
      }
    }
  }


  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const filterActivities = (activities) => {
    let filtered = activities

    // Filter by type
    if (activityTypeFilter !== 'All') {
      filtered = filtered.filter(activity => {
        const type = activity.type.toLowerCase()
        switch (activityTypeFilter) {
          case 'Email':
            return type.includes('email') || type.includes('draft')
          case 'Offerings':
            return type.includes('inventory') || type.includes('category')
          case 'Other':
            return !type.includes('email') && !type.includes('draft') && !type.includes('inventory') && !type.includes('category')
          default:
            return true
        }
      })
    }

    // Filter by time (simplified - you could enhance this with actual date parsing)
    if (activityTimeFilter !== 'All Time') {
      filtered = filtered.filter(activity => {
        const time = activity.time.toLowerCase()
        switch (activityTimeFilter) {
          case '24 Hours':
            return time.includes('min') || time.includes('hour') || time.includes('just now')
          case '7 Days':
            return !time.includes('day') || parseInt(time) <= 7
          case '30 Days':
            return !time.includes('day') || parseInt(time) <= 30
          default:
            return true
        }
      })
    }

    return filtered
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <style>
        {`
          /* Hide scrollbars */
          body {
            overflow-x: hidden !important;
          }
        `}
      </style>
      <style>
        {`
          @media (min-width: 1024px) and (max-width: 1400px) {
            .analytics-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
      <Navbar />
      
      {loading && (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      )}
      
      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 lg:px-8 py-6 mb-6"
          variants={itemVariants}
        >
          <div className="w-full mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-7xl">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amethyst-500 to-blue_violet-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Analytics Dashboard
            </motion.h1>
            
            <motion.p
              className="text-gray-600 text-base sm:text-lg mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Track your email performance and business insights
            </motion.p>
            
            <motion.div
              className="w-16 h-1 bg-amethyst-500 mx-auto rounded-full"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6"
          variants={itemVariants}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Time Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent"
              >
                <option value="all">All Metrics</option>
                <option value="drafts">Draft Creation</option>
                <option value="categories">Categories</option>
                <option value="activity">Activity</option>
              </select>
            </div>

            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 bg-amethyst-500 text-white px-4 py-2 rounded-lg hover:bg-amethyst-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts This Week</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.draftsThisWeek.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails Drafted</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalDrafts.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Saved (All Time)</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.hoursSaved.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Categories Pie Chart */}
        <div className="mb-6">
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            variants={cardVariants}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Categories</h3>
            
            {analyticsData.topCategories.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Pie Chart */}
              <div className="relative w-64 h-64 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  {/* Calculate total for percentages */}
                  {(() => {
                    const total = analyticsData.topCategories.reduce((sum, cat) => sum + cat.count, 0);
                    let cumulativeAngle = 0;
                    
                    const colors = [
                      '#8B5CF6', // amethyst-500 (purple)
                      '#EF4444', // red-500 (red)
                      '#F59E0B', // amber-500 (orange)
                      '#10B981', // emerald-500 (green)
                      '#3B82F6', // blue-500 (blue)
                      '#EC4899', // pink-500 (pink)
                      '#8B5A2B', // amber-800 (brown)
                      '#6B7280'  // gray-500 (gray)
                    ];
                    
                    return analyticsData.topCategories.map((category, index) => {
                      const percentage = (category.count / total) * 100;
                      const angle = (percentage / 100) * 360;
                      
                      // Calculate path for this segment
                      const startAngle = cumulativeAngle;
                      const endAngle = cumulativeAngle + angle;
                      cumulativeAngle += angle;
                      
                      const startAngleRad = (startAngle * Math.PI) / 180;
                      const endAngleRad = (endAngle * Math.PI) / 180;
                      
                      const x1 = 100 + 70 * Math.cos(startAngleRad);
                      const y1 = 100 + 70 * Math.sin(startAngleRad);
                      const x2 = 100 + 70 * Math.cos(endAngleRad);
                      const y2 = 100 + 70 * Math.sin(endAngleRad);
                      
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M 100 100`,
                        `L ${x1} ${y1}`,
                        `A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        `Z`
                      ].join(' ');
                      
                      return (
                        <path
                          key={category.name}
                          d={pathData}
                          fill={colors[index % colors.length]}
                          className="transition-all duration-300 hover:opacity-80"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }}
                        />
                      );
                    });
                  })()}
                  
                  {/* Center circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="50"
                    fill="white"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Center text - properly positioned */}
                  <text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    className="text-sm font-semibold fill-gray-700"
                  >
                    Total
                  </text>
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    className="text-lg font-bold fill-gray-900"
                  >
                    {analyticsData.topCategories.reduce((sum, cat) => sum + cat.count, 0)}
                  </text>
                </svg>
              </div>
              
              {/* Legend */}
              <div className="flex-1 space-y-3">
                {analyticsData.topCategories.map((category, index) => {
                  const total = analyticsData.topCategories.reduce((sum, cat) => sum + cat.count, 0);
                  const percentage = ((category.count / total) * 100).toFixed(1);
                  const colors = [
                    '#8B5CF6', // amethyst-500 (purple)
                    '#EF4444', // red-500 (red)
                    '#F59E0B', // amber-500 (orange)
                    '#10B981', // emerald-500 (green)
                    '#3B82F6', // blue-500 (blue)
                    '#EC4899', // pink-500 (pink)
                    '#8B5A2B', // amber-800 (brown)
                    '#6B7280'  // gray-500 (gray)
                  ];
                  
                  return (
                    <div key={category.name} className="flex items-center justify-between group">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3 transition-all duration-200 group-hover:scale-110"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-600">{category.count} inquiries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Categories will appear here once you start receiving inquiries. 
                  Add some offerings to get started!
                </p>
                <button 
                  onClick={() => window.location.href = '/manage-inventory'}
                  className="inline-flex items-center gap-2 bg-amethyst-500 text-white px-4 py-2 rounded-lg hover:bg-amethyst-600 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Manage Offerings
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          variants={cardVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="flex items-center gap-2 bg-amethyst-500 text-white px-4 py-2 rounded-lg hover:bg-amethyst-600 transition-colors">
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>

          {/* Activity Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-200">
            {/* Type Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <div className="flex gap-1">
                {['All', 'Email', 'Offerings', 'Other'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActivityTypeFilter(type)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                      activityTypeFilter === type
                        ? 'bg-amethyst-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Time:</span>
              <div className="flex gap-1">
                {['All Time', '24 Hours', '7 Days', '30 Days'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setActivityTimeFilter(time)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                      activityTimeFilter === time
                        ? 'bg-amethyst-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {filterActivities(analyticsData.recentActivity).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            {filterActivities(analyticsData.recentActivity).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {analyticsData.recentActivity.length === 0 
                    ? "Activity will appear here as you use Larynx AI to manage your emails and offerings."
                    : "No activities found for the selected filters"
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>

    {/* Notification Modal */}
    <AnimatePresence>
      {notification && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-100' :
                notification.type === 'error' ? 'bg-red-100' :
                notification.type === 'warning' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {notification.type === 'success' && (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  notification.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-80 ${
                  notification.type === 'success' ? 'hover:bg-green-100' :
                  notification.type === 'error' ? 'hover:bg-red-100' :
                  notification.type === 'warning' ? 'hover:bg-yellow-100' :
                  'hover:bg-blue-100'
                }`}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnalyticsModern
