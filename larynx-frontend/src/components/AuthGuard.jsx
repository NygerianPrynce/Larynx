import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthGuard = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessages, setAuthMessages] = useState([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const navigate = useNavigate()

  const authLoadingMessages = [
    'Checking authentication...',
    'Verifying your session...',
    'Loading your account...',
    'Almost ready...'
  ]

  useEffect(() => {
    checkAuthStatus()
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

  const checkAuthStatus = async () => {
    try {
      // Start the animated messages
      setAuthMessages(authLoadingMessages)
      setCurrentMessageIndex(0)
      
      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/auth/check`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.authenticated) {
          setIsAuthenticated(true)
          // Redirect to the appropriate page based on user status
          if (data.redirect_to && data.redirect_to !== window.location.pathname) {
            navigate(data.redirect_to, { replace: true })
          }
        } else {
          // Not authenticated, stay on current page (likely login)
          setIsAuthenticated(false)
        }
      } else {
        // Auth check failed, stay on current page
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsChecking(false)
    }
  }

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(139, 92, 246, 0.3)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          
          {authMessages.length > 0 && (
            <div style={{
              marginTop: '20px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p style={{
                color: '#8b5cf6',
                fontSize: '16px',
                fontWeight: '500',
                margin: 0
              }} className="auth-message" key={currentMessageIndex}>
                {authMessages[currentMessageIndex]}
              </p>
            </div>
          )}
          
          {authMessages.length === 0 && (
            <p style={{
              color: 'white',
              fontSize: '18px',
              margin: 0
            }}>Checking authentication...</p>
          )}
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes messageSlide {
            0% { opacity: 0; transform: translateY(10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
          }
          
          .auth-message {
            animation: messageSlide 2s ease-in-out;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
        `}</style>
      </div>
    )
  }

  // Render children if authenticated or if we're on a public page
  return children
}

export default AuthGuard
