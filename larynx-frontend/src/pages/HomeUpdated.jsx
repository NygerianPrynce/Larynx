// Updated Home.jsx using new services and components
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ParticleBackground from '../components/ParticleBackground'
import { useUser } from '../contexts/UserContext'
import { useAnalytics } from '../hooks/useApi'
import ApiService from '../services/apiService'
import logoImage from '../assets/logo.png'

// Custom SVG Icons (keeping your existing ones)
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
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Use new context and hooks
  const { user, isLoading: userLoading, error: userError } = useUser()
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics()
  
  const [emailStats, setEmailStats] = useState({
    today: 0,
    thisWeek: 0,
    hoursSaved: '0 hours'
  })
  const [recentActivity, setRecentActivity] = useState([])

  // Helper functions (keeping your existing logic)
  const getActivityType = (activityType) => {
    const typeMap = {
      'draft_created': 'draft',
      'email_processed': 'email',
      'inventory_updated': 'inventory',
      'user_action': 'action'
    }
    return typeMap[activityType] || 'recently'
  }

  const getActivityStatus = (activityType) => {
    const statusMap = {
      'draft_created': 'success',
      'email_processed': 'info',
      'inventory_updated': 'warning',
      'user_action': 'neutral'
    }
    return statusMap[activityType] || 'neutral'
  }

  const formatTimeAgo = (timestamp) => {
    try {
      const now = new Date()
      const time = new Date(timestamp)
      const diffInSeconds = Math.floor((now - time) / 1000)
      
      if (diffInSeconds < 60) return 'just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      return `${Math.floor(diffInSeconds / 86400)}d ago`
    } catch (error) {
      return 'recently'
    }
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Process analytics data when it loads
  useEffect(() => {
    if (analytics) {
      setEmailStats({
        today: analytics.total_drafts || 0,
        thisWeek: analytics.drafts_this_week || 0,
        hoursSaved: analytics.estimated_hours_saved ? `${analytics.estimated_hours_saved} hours` : '0 hours'
      })
      
      if (analytics.recent_activity && Array.isArray(analytics.recent_activity)) {
        const formattedActivity = analytics.recent_activity
          .slice(0, 3)
          .map((activity, index) => ({
            id: index,
            type: getActivityType(activity.type),
            message: activity.message || 'Unknown activity',
            time: formatTimeAgo(activity.timestamp),
            status: getActivityStatus(activity.type),
            originalType: activity.type
          }))
        setRecentActivity(formattedActivity)
      }
    }
  }, [analytics])

  // Handle errors
  useEffect(() => {
    if (userError || analyticsError) {
      const error = userError || analyticsError
      ApiService.handleError(error, 'Home page', navigate)
    }
  }, [userError, analyticsError, navigate])

  const isLoading = userLoading || analyticsLoading

  // Your existing styles (keeping them the same)
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#ffffff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    },
    // ... rest of your existing styles
  }

  if (isLoading) {
    return (
      <ParticleBackground>
        <div style={styles.container}>
          <Navbar />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <div>Loading your dashboard...</div>
            </div>
          </div>
        </div>
      </ParticleBackground>
    )
  }

  return (
    <ParticleBackground>
      <div style={styles.container}>
        <Navbar />
        
        {/* Your existing JSX content, but now using:
            - user.name instead of userName
            - emailStats from analytics
            - recentActivity from analytics
            - All the same styling and layout
        */}
        
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              Welcome back, {user?.name || 'there'}! 👋
            </h1>
            <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Mail />
                <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>Emails Today</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{emailStats.today}</div>
            </div>

            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Zap />
                <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>This Week</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{emailStats.thisWeek}</div>
            </div>

            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Package />
                <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>Time Saved</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{emailStats.hoursSaved}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/inventory')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Manage Offerings <ArrowRight />
              </button>
              
              <button
                onClick={() => navigate('/analytics')}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                View Analytics <ArrowRight />
              </button>
              
              <button
                onClick={() => navigate('/settings')}
                style={{
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                <Settings /> Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recent Activity</h2>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '12px',
                padding: '1rem'
              }}>
                {recentActivity.map((activity) => (
                  <div key={activity.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%',
                      backgroundColor: activity.status === 'success' ? '#10b981' : 
                                     activity.status === 'warning' ? '#f59e0b' : '#6b7280',
                      marginRight: '1rem'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500' }}>{activity.message}</div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ParticleBackground>
  )
}

export default Home
