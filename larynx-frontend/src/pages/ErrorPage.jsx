import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Custom SVG Icons
const AlertTriangle = () => (
  <svg style={{ display: 'inline', width: '64px', height: '64px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
  </svg>
)

const Home = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const RefreshCw = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const ArrowLeft = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ErrorPage = ({ 
  errorCode = '404', 
  title = 'Page Not Found', 
  message = "The page you're looking for doesn't exist or has been moved.",
  showBackButton = true,
  showHomeButton = true,
  showRefreshButton = false
}) => {
  const navigate = useNavigate()
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Generate floating particles
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.1 + 0.05,
          duration: Math.random() * 25 + 20,
          delay: Math.random() * 15
        })
      }
      setParticles(newParticles)
    }
    generateParticles()
  }, [])

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/home')
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const getErrorIcon = () => {
    switch (errorCode) {
      case '404':
        return '🔍'
      case '500':
        return '⚠️'
      case '403':
        return '🔒'
      default:
        return '❌'
    }
  }

  const getErrorColor = () => {
    switch (errorCode) {
      case '404':
        return '#3b82f6' // Blue
      case '500':
        return '#ef4444' // Red
      case '403':
        return '#f59e0b' // Yellow
      default:
        return '#8b5cf6' // Purple
    }
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
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .error-content {
            animation: fadeIn 0.8s ease-out;
          }
          
          .error-icon {
            animation: bounce 2s infinite;
          }
          
          .button:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3) !important;
          }
          
          .primary-button:hover {
            box-shadow: 0 8px 25px ${getErrorColor()}40 !important;
          }
        `}
      </style>

      {/* Animated Background */}
      <div style={{
        ...styles.backgroundOrb1,
        background: `radial-gradient(circle, ${getErrorColor()}30 0%, transparent 70%)`
      }}></div>
      <div style={{
        ...styles.backgroundOrb2,
        background: `radial-gradient(circle, ${getErrorColor()}20 0%, transparent 70%)`
      }}></div>
      
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
              background: `radial-gradient(circle, ${getErrorColor()}40 0%, transparent 100%)`,
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: particle.opacity,
              animation: `float ${particle.duration}s linear infinite ${particle.delay}s, floatHorizontal 5s ease-in-out infinite ${particle.delay * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.main} className="error-content">
        {/* Error Icon */}
        <div style={styles.iconContainer} className="error-icon">
          <div style={{
            ...styles.errorCodeBadge,
            borderColor: getErrorColor(),
            color: getErrorColor()
          }}>
            {errorCode}
          </div>
          <div style={styles.errorEmoji}>{getErrorIcon()}</div>
        </div>

        {/* Error Content */}
        <div style={styles.content}>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.message}>{message}</p>
          
          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            {showHomeButton && (
              <button
                onClick={() => navigate('/home')}
                style={{
                  ...styles.primaryButton,
                  background: `linear-gradient(45deg, ${getErrorColor()}, ${getErrorColor()}CC)`
                }}
                className="button primary-button"
              >
                <Home />
                <span>Go Home</span>
              </button>
            )}
            
            {showBackButton && (
              <button
                onClick={handleGoBack}
                style={styles.secondaryButton}
                className="button"
              >
                <ArrowLeft />
                <span>Go Back</span>
              </button>
            )}
            
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                style={styles.secondaryButton}
                className="button"
              >
                <RefreshCw />
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div style={styles.helpText}>
          <p style={styles.helpMessage}>
            Need help? <a href="mailto:fadhillawal06@gmail.com" style={styles.helpLink}>Contact Support</a>
          </p>
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
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backgroundOrb1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'pulse 8s ease-in-out infinite'
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: '15%',
    right: '10%',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 8s ease-in-out infinite 4s'
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
    textAlign: 'center',
    maxWidth: '600px',
    padding: '40px',
    margin: '0 auto'
  },
  iconContainer: {
    marginBottom: '32px',
    position: 'relative'
  },
  errorCodeBadge: {
    display: 'inline-block',
    fontSize: '72px',
    fontWeight: 'bold',
    padding: '20px 40px',
    border: '3px solid',
    borderRadius: '20px',
    marginBottom: '16px',
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)'
  },
  errorEmoji: {
    fontSize: '48px',
    marginTop: '16px'
  },
  content: {
    marginBottom: '48px'
  },
  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '16px',
    background: 'linear-gradient(45deg, #ffffff, #d1d5db)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  message: {
    fontSize: '18px',
    color: '#d1d5db',
    lineHeight: '1.6',
    marginBottom: '32px',
    maxWidth: '500px',
    margin: '0 auto 32px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.8), rgba(17, 24, 39, 0.8))',
    color: 'white',
    border: '1px solid #374151',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    backdropFilter: 'blur(10px)'
  },
  helpText: {
    paddingTop: '32px',
    borderTop: '1px solid #374151'
  },
  helpMessage: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  helpLink: {
    color: '#8b5cf6',
    textDecoration: 'none',
    fontWeight: '500'
  }
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