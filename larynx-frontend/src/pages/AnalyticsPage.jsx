// File: pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

// Custom SVG Icons
const TrendingUp = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const Mail = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Package = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const Clock = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Calendar = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
)

const Zap = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const Filter = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
)

const AnalyticsPage = () => {
  const [particles, setParticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    total_drafts: 0,
    drafts_this_week: 0,
    estimated_hours_saved: 0,
    recent_activity: []
  })
  const [filteredActivity, setFilteredActivity] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [timeRange, setTimeRange] = useState('all')

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
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
      
      const diffInWeeks = Math.floor(diffInDays / 7)
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
    } catch (error) {
      return 'recently'
    }
  }

  const formatFullDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Unknown date'
    }
  }

  useEffect(() => {
    // Generate floating particles
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.2 + 0.05,
          duration: Math.random() * 25 + 20,
          delay: Math.random() * 15
        })
      }
      setParticles(newParticles)
    }
    generateParticles()
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics`, {
          credentials: 'include'
        })
        if (response.ok && isMounted) {
          const data = await response.json()
          setAnalytics(data)
          
          // Process activity with proper formatting
          if (data.recent_activity && Array.isArray(data.recent_activity)) {
            const formattedActivity = data.recent_activity.map((activity, index) => ({
              id: index,
              type: activity.type === 'email_draft' ? 'email' : 
                    activity.type === 'inventory_edit' ? 'inventory' : 'other',
              message: activity.message || 'Unknown activity',
              time: formatTimeAgo(activity.timestamp),
              fullDate: formatFullDate(activity.timestamp),
              timestamp: activity.timestamp,
              status: activity.type === 'email_draft' ? 'draft' :
                      activity.type === 'inventory_edit' ? 'success' : 'info',
              originalType: activity.type
            }))
            setFilteredActivity(formattedActivity)
          }
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchAnalytics()

    return () => {
      isMounted = false
    }
  }, [])

  // Filter activity based on selected filters
  useEffect(() => {
    if (!analytics.recent_activity) return

    let filtered = analytics.recent_activity.map((activity, index) => ({
      id: index,
      type: activity.type === 'email_draft' ? 'email' : 
            activity.type === 'inventory_edit' ? 'inventory' : 'other',
      message: activity.message || 'Unknown activity',
      time: formatTimeAgo(activity.timestamp),
      fullDate: formatFullDate(activity.timestamp),
      timestamp: activity.timestamp,
      status: activity.type === 'email_draft' ? 'draft' :
              activity.type === 'inventory_edit' ? 'success' : 'info',
      originalType: activity.type
    }))

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedFilter)
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp)
        const diffInDays = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24))
        
        switch (timeRange) {
          case '24h': return diffInDays < 1
          case '7d': return diffInDays < 7
          case '30d': return diffInDays < 30
          default: return true
        }
      })
    }

    setFilteredActivity(filtered)
  }, [selectedFilter, timeRange, analytics.recent_activity])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'email': return <Mail />
      case 'inventory': return <Package />
      default: return <Zap />
    }
  }

  const getActivityStats = () => {
    const total = filteredActivity.length
    const emailCount = filteredActivity.filter(a => a.type === 'email').length
    const inventoryCount = filteredActivity.filter(a => a.type === 'inventory').length
    const otherCount = total - emailCount - inventoryCount

    return { total, emailCount, inventoryCount, otherCount }
  }

  const activityStats = getActivityStats()

  return (
    <div style={styles.container}>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
          
          @keyframes float {
            0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(30px) rotate(360deg); opacity: 0; }
          }
          
          @keyframes floatHorizontal {
            0% { transform: translateX(-3px); }
            50% { transform: translateX(3px); }
            100% { transform: translateX(-3px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.05); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(139, 92, 246, 0.3);
          }
          
          .activity-item:hover {
            background: rgba(55, 65, 81, 0.7);
            transform: translateX(5px);
          }
          
          .filter-button:hover {
            background: rgba(139, 92, 246, 0.3);
            transform: scale(1.02);
          }
          
          .filter-button.active {
            background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          }
        `}
      </style>

      {/* Animated Background */}
      <div style={styles.backgroundOrb1}></div>
      <div style={styles.backgroundOrb2}></div>
      
      {/* Floating Particles */}
      <div style={styles.particleContainer}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: particle.opacity,
              animation: `float ${particle.duration}s linear infinite ${particle.delay}s, floatHorizontal 5s ease-in-out infinite ${particle.delay * 0.3}s`
            }}
          />
        ))}
      </div>

      <Navbar />
      
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <TrendingUp />
          </div>
          <h1 style={styles.title}>Analytics Dashboard</h1>
          <p style={styles.subtitle}>
            Track your AI email performance and activity insights
          </p>
        </div>

        {isLoading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Main Stats - Hero Style */}
            <div style={styles.heroStats}>
              <div style={styles.heroStatItem}>
                <div style={styles.heroStatValue}>{analytics.total_drafts}</div>
                <div style={styles.heroStatLabel}>total drafts</div>
              </div>
              <div style={styles.heroStatDivider}></div>
              <div style={styles.heroStatItem}>
                <div style={styles.heroStatValue}>{analytics.drafts_this_week}</div>
                <div style={styles.heroStatLabel}>this week</div>
              </div>
              <div style={styles.heroStatDivider}></div>
              <div style={styles.heroStatItem}>
                <div style={styles.heroStatValue}>{analytics.estimated_hours_saved} hours</div>
                <div style={styles.heroStatLabel}>time saved</div>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Activity Breakdown</h2>
              <div style={styles.breakdownGrid}>
                <div style={styles.breakdownCard}>
                  <div style={styles.breakdownIcon}>
                    <Mail />
                  </div>
                  <div style={styles.breakdownContent}>
                    <div style={styles.breakdownNumber}>{activityStats.emailCount}</div>
                    <div style={styles.breakdownLabel}>Email Activities</div>
                  </div>
                </div>
                <div style={styles.breakdownCard}>
                  <div style={{...styles.breakdownIcon, backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6'}}>
                    <Package />
                  </div>
                  <div style={styles.breakdownContent}>
                    <div style={{...styles.breakdownNumber, color: '#3b82f6'}}>{activityStats.inventoryCount}</div>
                    <div style={styles.breakdownLabel}>Inventory Updates</div>
                  </div>
                </div>
                <div style={styles.breakdownCard}>
                  <div style={{...styles.breakdownIcon, backgroundColor: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4'}}>
                    <Zap />
                  </div>
                  <div style={styles.breakdownContent}>
                    <div style={{...styles.breakdownNumber, color: '#06b6d4'}}>{activityStats.otherCount}</div>
                    <div style={styles.breakdownLabel}>Other Activities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div style={styles.section}>
              <div style={styles.activityHeader}>
                <h2 style={styles.sectionTitle}>Complete Activity Feed</h2>
                <div style={styles.filterContainer}>
                  <div style={styles.filterGroup}>
                    <span style={styles.filterLabel}>Type:</span>
                    <div style={styles.filterButtons}>
                      {['all', 'email', 'inventory', 'other'].map((filter) => (
                        <button
                          key={filter}
                          style={{
                            ...styles.filterButton,
                            ...(selectedFilter === filter ? styles.activeFilter : {})
                          }}
                          className={`filter-button ${selectedFilter === filter ? 'active' : ''}`}
                          onClick={() => setSelectedFilter(filter)}
                        >
                          <Filter />
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={styles.filterGroup}>
                    <span style={styles.filterLabel}>Time:</span>
                    <div style={styles.filterButtons}>
                      {[
                        { key: 'all', label: 'All Time' },
                        { key: '24h', label: '24 Hours' },
                        { key: '7d', label: '7 Days' },
                        { key: '30d', label: '30 Days' }
                      ].map((filter) => (
                        <button
                          key={filter.key}
                          style={{
                            ...styles.filterButton,
                            ...(timeRange === filter.key ? styles.activeFilter : {})
                          }}
                          className={`filter-button ${timeRange === filter.key ? 'active' : ''}`}
                          onClick={() => setTimeRange(filter.key)}
                        >
                          <Calendar />
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.activityFeed}>
                {filteredActivity.length > 0 ? (
                  filteredActivity.map((activity) => (
                    <div key={activity.id} style={styles.activityItem} className="activity-item">
                      <div style={styles.activityIconContainer}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div style={styles.activityDetails}>
                        <div style={styles.activityMessage}>{activity.message}</div>
                        <div style={styles.activityMeta}>
                          <span style={styles.activityTime}>{activity.time}</span>
                          <span style={styles.activityDot}>•</span>
                          <span style={styles.activityDate}>{activity.fullDate}</span>
                        </div>
                      </div>
                      <div style={{
                        ...styles.activityStatus,
                        backgroundColor: activity.status === 'sent' ? '#10b981' : 
                                         activity.status === 'success' ? '#8b5cf6' : 
                                         activity.status === 'draft' ? '#f59e0b' : '#6b7280'
                      }}>
                        {activity.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📊</div>
                    <h3 style={styles.emptyTitle}>No Activities Found</h3>
                    <p style={styles.emptyText}>
                      {selectedFilter !== 'all' || timeRange !== 'all' 
                        ? 'Try adjusting your filters to see more activities.'
                        : 'Start using Larynx AI to see your activity analytics here!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #2d2d2d 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundOrb1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 10s ease-in-out infinite'
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: '15%',
    right: '10%',
    width: '160px',
    height: '160px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 10s ease-in-out infinite 5s'
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  main: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '100%',
    margin: '0',
    padding: '0 32px 32px 32px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
    padding: '48px 0'
  },
  headerIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    borderRadius: '50%',
    marginBottom: '24px',
    color: 'white'
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '16px',
    background: 'linear-gradient(45deg, #ffffff, #a855f7, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '18px',
    color: '#d1d5db',
    maxWidth: '600px',
    margin: '0 auto'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    gap: '20px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(139, 92, 246, 0.3)',
    borderTopColor: '#8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '48px',
    marginBottom: '48px',
    padding: '40px 0'
  },
  heroStatItem: {
    textAlign: 'center'
  },
  heroStatValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: '8px'
  },
  heroStatLabel: {
    fontSize: '14px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  heroStatDivider: {
    width: '1px',
    height: '60px',
    background: 'linear-gradient(to bottom, transparent, #374151, transparent)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '48px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '32px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid #374151',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  statIcon: {
    width: '56px',
    height: '56px',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8b5cf6',
    flexShrink: 0
  },
  statContent: {
    flex: 1
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: '6px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  section: {
    marginBottom: '48px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: 'white'
  },
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  breakdownCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.3), rgba(17, 24, 39, 0.3))',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid #374151'
  },
  breakdownIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8b5cf6',
    flexShrink: 0
  },
  breakdownContent: {
    flex: 1
  },
  breakdownNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: '4px'
  },
  breakdownLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    gap: '24px',
    flexWrap: 'wrap'
  },
  filterContainer: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  filterLabel: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: '500',
    minWidth: 'fit-content'
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: 'rgba(55, 65, 81, 0.5)',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#d1d5db',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  activeFilter: {
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    borderColor: 'transparent',
    color: 'white'
  },
  activityFeed: {
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid #374151',
    overflow: 'hidden'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
    borderBottom: '1px solid #374151',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  activityIconContainer: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8b5cf6',
    flexShrink: 0
  },
  activityDetails: {
    flex: 1,
    minWidth: 0
  },
  activityMessage: {
    fontSize: '15px',
    color: 'white',
    marginBottom: '6px',
    fontWeight: '500',
    lineHeight: '1.4'
  },
  activityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#9ca3af'
  },
  activityTime: {
    fontWeight: '500'
  },
  activityDot: {
    color: '#6b7280'
  },
  activityDate: {
    color: '#9ca3af'
  },
  activityStatus: {
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
    flexShrink: 0
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    color: '#9ca3af'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '24px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginBottom: '12px'
  },
  emptyText: {
    fontSize: '14px',
    lineHeight: '1.6',
    maxWidth: '400px',
    margin: '0 auto'
  }
}

export default AnalyticsPage