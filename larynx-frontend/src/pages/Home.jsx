// File: pages/Home.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import logoImage from '../assets/logo.png' // Import your custom logo

// Custom SVG Icons
const ArrowRight = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px', marginLeft: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

const Mail = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Zap = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const Package = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const Settings = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Home = () => {
  const navigate = useNavigate()
  const [particles, setParticles] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userName, setUserName] = useState('there')
  const [emailStats, setEmailStats] = useState({
    today: 0,
    thisWeek: 0,
    hoursSaved: '0 hours'
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

    // Fetch user name
    const fetchUserName = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/name`, {
          credentials: 'include'
        })
        if (response.ok && isMounted) {
          const data = await response.json()
          setUserName(data.name || 'there')
        }
      } catch (error) {
        console.error('Failed to fetch user name:', error)
      }
    }

    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics`, {
          credentials: 'include'
        })
        if (response.ok && isMounted) {
          const data = await response.json()
          
          // Update email stats
          setEmailStats({
            today: data.total_drafts || 0,
            thisWeek: data.drafts_this_week || 0,
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
        console.error('Failed to fetch analytics:', error)
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

    // Generate floating particles
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 100; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          duration: Math.random() * 15 + 10,
          delay: Math.random() * 10
        })
      }
      if (isMounted) {
        setParticles(newParticles)
      }
    }
    generateParticles()

    // Update time every minute
    const timer = setInterval(() => {
      if (isMounted) {
        setCurrentTime(new Date())
      }
    }, 60000)

    // Cleanup function
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  const quickActions = [
    {
      title: 'Manage Inventory',
      description: 'Update your product catalog and availability',
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
    <div style={styles.container}>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.05); }
          }
          
          @keyframes float {
            0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(30px) rotate(360deg); opacity: 0; }
          }
          
          @keyframes floatHorizontal {
            0% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            100% { transform: translateX(-5px); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes logoFloat {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.05) rotate(2deg); }
            50% { transform: scale(1.1) rotate(0deg); }
            75% { transform: scale(1.05) rotate(-2deg); }
          }
          
          .quick-action-card:hover {
            transform: scale(1.05);
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
          }
          
          .activity-item:hover {
            background: rgba(55, 65, 81, 0.7);
          }
          
          .hero-logo {
            animation: logoFloat 6s ease-in-out infinite;
          }
          
          .hero-logo:hover {
            animation-play-state: paused;
            transform: scale(1.15) !important;
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
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: particle.opacity,
              animation: `float ${particle.duration}s linear infinite ${particle.delay}s, floatHorizontal 3s ease-in-out infinite ${particle.delay * 0.3}s`
            }}
          />
        ))}
      </div>

      <Navbar />
      
      <div style={styles.main}>
        {/* Hero Welcome Section */}
        <div style={styles.heroWelcome}>
          <div style={styles.heroContent}>
            <div style={styles.heroGlow}></div>
            
            {/* Hero Logo */}
            <div style={styles.heroLogoContainer}>
              <img 
                src={logoImage}
                alt="Larynx AI Logo"
                style={styles.heroLogo}
                className="hero-logo"
              />
            </div>
            
            <h1 style={styles.heroTitle}>
              {getGreeting()}, {userName}! 
            </h1>
            <p style={styles.heroSubtitle}>
              Your AI email assistant is ready to help you craft perfect messages
            </p>
            <div style={styles.heroStats}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{emailStats.today}</div>
                <div style={styles.statLabel}>emails today</div>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{emailStats.thisWeek}</div>
                <div style={styles.statLabel}>this week</div>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{emailStats.hoursSaved}</div>
                <div style={styles.statLabel}>hours saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <div 
                key={index}
                style={{...styles.quickActionCard, borderColor: action.color + '40'}} 
                className="quick-action-card"
                onClick={action.action}
              >
                <div style={{...styles.quickActionIcon, color: action.color}}>
                  {action.icon}
                </div>
                <h3 style={styles.quickActionTitle}>{action.title}</h3>
                <p style={styles.quickActionDescription}>{action.description}</p>
                <div style={{...styles.quickActionArrow, color: action.color}}>
                  <ArrowRight />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          <div style={styles.activityContainer}>
            {isLoading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p>Loading activity...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} style={styles.activityItem} className="activity-item">
                  <div style={styles.activityIcon}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityMessage}>{activity.message}</div>
                    <div style={styles.activityTime}>{activity.time}</div>
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
                <p>No recent activity yet. Start using Larynx AI to see your activity here!</p>
              </div>
            )}
          </div>
        </div>
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
    top: '20%',
    left: '20%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 6s ease-in-out infinite'
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: '20%',
    right: '20%',
    width: '250px',
    height: '250px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 6s ease-in-out infinite 3s'
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px'
  },
  heroWelcome: {
    position: 'relative',
    marginBottom: '48px',
    padding: '80px 0 120px',
    textAlign: 'center'
  },
  heroContent: {
    position: 'relative',
    zIndex: 2
  },
  heroGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '400px',
    background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
    filter: 'blur(60px)',
    zIndex: 1
  },
  heroLogoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px'
  },
  heroLogo: {
    width: '120px',
    height: '120px',
    borderRadius: '24px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 10px 30px rgba(139, 92, 246, 0.5))',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  heroTitle: {
    fontSize: '64px',
    fontWeight: 'bold',
    marginBottom: '24px',
    background: 'linear-gradient(45deg, #ffffff, #a855f7, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1.2'
  },
  heroSubtitle: {
    fontSize: '22px',
    color: '#d1d5db',
    marginBottom: '48px',
    maxWidth: '700px',
    margin: '0 auto 48px'
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '48px',
    marginTop: '48px'
  },
  statItem: {
    textAlign: 'center'
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statDivider: {
    width: '1px',
    height: '60px',
    background: 'linear-gradient(to bottom, transparent, #374151, transparent)'
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
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  quickActionCard: {
    padding: '32px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid #374151',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  quickActionIcon: {
    fontSize: '32px',
    marginBottom: '16px',
    display: 'block'
  },
  quickActionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: 'white'
  },
  quickActionDescription: {
    fontSize: '14px',
    color: '#d1d5db',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  quickActionArrow: {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    fontSize: '16px'
  },
  activityContainer: {
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid #374151',
    overflow: 'hidden'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderBottom: '1px solid #374151',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  activityIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8b5cf6',
    flexShrink: 0
  },
  activityContent: {
    flex: 1
  },
  activityMessage: {
    fontSize: '14px',
    color: 'white',
    marginBottom: '4px'
  },
  activityTime: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  activityStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    textTransform: 'capitalize'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(139, 92, 246, 0.3)',
    borderTopColor: '#8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#9ca3af',
    fontSize: '14px'
  }
}

export default Home