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
  AlertCircle
} from 'lucide-react'

const AnalyticsModern = () => {
  // Mock data for demonstration
  const [analyticsData, setAnalyticsData] = useState({
    draftsThisWeek: 53,
    totalDrafts: 892,
    hoursSaved: 89.2,
    topCategories: [
      { name: 'Consulting', count: 234 },
      { name: 'Design', count: 189 },
      { name: 'Marketing', count: 156 },
      { name: 'Writing', count: 98 },
      { name: 'Development', count: 76 }
    ],
    recentActivity: [
      { type: 'email_processed', message: 'New inquiry processed for Website Design', time: '2 min ago', status: 'success' },
      { type: 'draft_created', message: 'Draft response created for Consulting inquiry', time: '5 min ago', status: 'success' },
      { type: 'category_added', message: 'New category "Events" added', time: '12 min ago', status: 'info' },
      { type: 'signoff_updated', message: 'Email sign off updated', time: '1 hour ago', status: 'success' },
      { type: 'user_activity', message: 'New user signed up', time: '2 hours ago', status: 'info' }
    ]
  })

  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [loading, setLoading] = useState(false)
  const [activityTypeFilter, setActivityTypeFilter] = useState('All')
  const [activityTimeFilter, setActivityTimeFilter] = useState('All Time')

  // Fetch real analytics data
  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      console.log('Fetching analytics from:', `${import.meta.env.VITE_API_URL}/analytics`)
      const [analyticsResponse, categoriesResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/analytics`),
        fetch(`${import.meta.env.VITE_API_URL}/analytics/categories`)
      ])
      
      console.log('Analytics response status:', analyticsResponse.status)
      console.log('Categories response status:', categoriesResponse.status)
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        console.log('Analytics data received:', analyticsData)
        let categoriesData = []
        
        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json()
          categoriesData = categoriesResult.categories || []
          console.log('Categories data received:', categoriesData)
        }
        
        setAnalyticsData(prev => ({
          ...prev,
          draftsThisWeek: analyticsData.drafts_this_week || 0,
          totalDrafts: analyticsData.total_drafts || 0,
          hoursSaved: analyticsData.estimated_hours_saved || 0,
          topCategories: (() => {
            const sortedCategories = categoriesData
              .map(cat => ({
                name: cat.category,
                count: cat.inquiry_count
              }))
              .sort((a, b) => b.count - a.count);
            
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
      } else {
        console.error('Analytics API error:', analyticsResponse.status, analyticsResponse.statusText)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
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

            <button className="flex items-center gap-2 bg-amethyst-500 text-white px-4 py-2 rounded-lg hover:bg-amethyst-600 transition-colors">
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
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No activities found for the selected filters</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AnalyticsModern
