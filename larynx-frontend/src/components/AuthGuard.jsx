import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthGuard = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
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
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Checking authentication...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
