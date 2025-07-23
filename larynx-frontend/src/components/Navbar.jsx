// File: components/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImage from '../assets/logo.png' // Import your custom logo

// Custom SVG Icons
const Home = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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

const TrendingUp = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const User = () => (
  <svg style={{ display: 'inline', width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const Bot = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const LogOut = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const Menu = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const X = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const Navbar = () => {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    navigate('/login')
  }

  const toggleMobileMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown
      if (!event.target.closest('.profile-container')) {
        setDropdownOpen(false)
      }
      
      // Close mobile menu
      if (!event.target.closest('.mobile-menu-container') && 
          !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      <style>
        {`
          .navbar-link:hover {
            color: #8b5cf6 !important;
            transform: translateY(-2px);
          }
          
          .navbar-profile:hover {
            background: rgba(139, 92, 246, 0.2) !important;
            transform: scale(1.02);
          }
          
          .profile-dropdown {
            animation: fadeIn 0.2s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .dropdown-item:hover {
            background: rgba(139, 92, 246, 0.3) !important;
          }
          
          .mobile-menu-slide {
            animation: slideDown 0.3s ease-out;
          }
          
          @media (max-width: 1024px) {
            .desktop-nav {
              display: none !important;
            }
            .mobile-menu-button {
              display: flex !important;
            }
          }
          
          @media (min-width: 1025px) {
            .desktop-nav {
              display: flex !important;
            }
            .mobile-menu-button {
              display: none !important;
            }
          }
          
          /* Responsive logo sizing - bigger at all breakpoints */
          @media (max-width: 768px) {
            .navbar-container {
              padding: 16px 20px !important;
            }
            .navbar-logo {
              font-size: 18px !important;
            }
            .logo-icon {
              width: 40px !important;
              height: 40px !important;
            }
          }
          
          @media (max-width: 480px) {
            .navbar-container {
              padding: 12px 16px !important;
            }
            .navbar-logo {
              font-size: 16px !important;
            }
            .logo-icon {
              width: 36px !important;
              height: 36px !important;
            }
          }
          
          /* Prevent logo compression */
          .navbar-logo {
            flex-shrink: 0 !important;
            min-width: fit-content !important;
          }
          
          .navbar-logo:hover {
            transform: scale(1.05);
          }
          
          .navbar-logo:hover .logo-icon {
            transform: scale(1.1);
          }
          
          /* Reduce nav gap on smaller screens instead of compressing logo */
          @media (max-width: 1200px) {
            .desktop-nav {
              gap: 24px !important;
            }
          }
          
          @media (max-width: 1100px) {
            .desktop-nav {
              gap: 16px !important;
            }
          }
          
          .nav-glow::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
            opacity: 0.5;
          }
          
          .mobile-menu-button:hover {
            background: rgba(139, 92, 246, 0.2) !important;
            transform: scale(1.05);
          }
        `}
      </style>
      <nav style={styles.nav} className="navbar-container nav-glow">
        <div style={styles.leftSection}>
          <div 
            style={styles.logo} 
            className="navbar-logo"
            onClick={() => navigate('/home')}
          >
            <img 
              src={logoImage}
              alt="Larynx AI Logo"
              style={styles.logoImage}
              className="logo-icon"
            />
            <span style={styles.logoText}>Larynx AI</span>
          </div>
          
          {/* Desktop Navigation */}
          <div style={styles.navLinks} className="desktop-nav">
            <Link to="/home" style={styles.link} className="navbar-link">
              <span style={{...styles.linkIcon, color: '#3b82f6'}}><Home /></span>
              <span>Dashboard</span>
            </Link>
            <Link to="/manage-inventory" style={styles.link} className="navbar-link">
              <span style={{...styles.linkIcon, color: '#8b5cf6'}}><Package /></span>
              <span>Inventory</span>
            </Link>
            <Link to="/analytics" style={styles.link} className="navbar-link">
              <span style={{...styles.linkIcon, color: '#10b981'}}><TrendingUp /></span>
              <span>Analytics</span>
            </Link>
            <Link to="/settings" style={styles.link} className="navbar-link">
              <span style={{...styles.linkIcon, color: '#f59e0b'}}><Settings /></span>
              <span>Settings</span>
            </Link>
          </div>
        </div>
        
        {/* Desktop Profile Button */}
        <div style={styles.profileContainer} className="profile-container desktop-nav">
          <button 
            style={styles.profileButton} 
            className="navbar-profile"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span style={{...styles.profileIcon, color: '#a855f7'}}><User /></span>
            <span>Account</span>
            <span style={styles.chevron}>▼</span>
          </button>
          {dropdownOpen && (
            <div style={styles.dropdown} className="profile-dropdown">
              <div style={styles.dropdownItem} className="dropdown-item" onClick={() => navigate('/analytics')}>
                <span style={{...styles.dropdownIcon, color: '#10b981'}}><TrendingUp /></span>
                <span>Analytics</span>
              </div>
              <div style={styles.dropdownItem} className="dropdown-item" onClick={() => navigate('/settings')}>
                <span style={{...styles.dropdownIcon, color: '#8b5cf6'}}><Bot /></span>
                <span>Settings</span>
              </div>
              <div style={styles.dropdownItem} className="dropdown-item" onClick={() => navigate('/manage-inventory')}>
                <span style={{...styles.dropdownIcon, color: '#3b82f6'}}><Package /></span>
                <span>Manage Inventory</span>
              </div>
              <div style={styles.dropdownSeparator}></div>
              <div style={styles.dropdownItem} className="dropdown-item" onClick={handleLogout}>
                <span style={{...styles.dropdownIcon, color: '#ef4444'}}><LogOut /></span>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          style={styles.mobileMenuButton}
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu - Moved outside nav for better positioning */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu} className="mobile-menu-container mobile-menu-slide">
          <div style={styles.mobileMenuContent}>
            <Link to="/home" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
              <span style={{...styles.mobileLinkIcon, color: '#3b82f6'}}><Home /></span>
              <span>Dashboard</span>
            </Link>
            <Link to="/manage-inventory" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
              <span style={{...styles.mobileLinkIcon, color: '#8b5cf6'}}><Package /></span>
              <span>Inventory</span>
            </Link>
            <Link to="/analytics" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
              <span style={{...styles.mobileLinkIcon, color: '#10b981'}}><TrendingUp /></span>
              <span>Analytics</span>
            </Link>
            <Link to="/settings" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
              <span style={{...styles.mobileLinkIcon, color: '#f59e0b'}}><Settings /></span>
              <span>Settings</span>
            </Link>
            <div style={styles.mobileDivider}></div>
            <div style={styles.mobileLink} onClick={() => { navigate('/analytics'); setMobileMenuOpen(false); }}>
              <span style={{...styles.mobileLinkIcon, color: '#10b981'}}><TrendingUp /></span>
              <span>Analytics</span>
            </div>
            <div style={styles.mobileLink} onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}>
              <span style={{...styles.mobileLinkIcon, color: '#8b5cf6'}}><Bot /></span>
              <span>AI Settings</span>
            </div>
            <div style={styles.mobileLink} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
              <span style={{...styles.mobileLinkIcon, color: '#ef4444'}}><LogOut /></span>
              <span>Logout</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(17, 24, 39, 0.9))',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid #374151',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    zIndex: 1000
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '48px',
    flexShrink: 0, // Prevents shrinking
    minWidth: 'fit-content' // Maintains minimum width
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flexShrink: 0, // Prevents logo from shrinking
    minWidth: 'fit-content' // Ensures logo area doesn't compress
  },
  logoImage: {
    width: '48px', // Increased from 32px
    height: '48px', // Increased from 32px
    borderRadius: '12px', // Increased border radius proportionally
    objectFit: 'contain',
    transition: 'all 0.3s ease',
    filter: 'drop-shadow(0 6px 12px rgba(139, 92, 246, 0.4))', // Enhanced shadow
    flexShrink: 0 // Prevents image from shrinking
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #a855f7, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    whiteSpace: 'nowrap', // Prevents text wrapping
    flexShrink: 0 // Prevents text from shrinking
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: '#d1d5db',
    fontWeight: '500',
    padding: '12px 20px',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    fontSize: '18px'
  },
  linkIcon: {
    fontSize: '16px'
  },
  profileContainer: {
    position: 'relative',
    zIndex: 10000
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.8), rgba(17, 24, 39, 0.8))',
    color: 'white',
    padding: '14px 22px',
    border: '1px solid #374151',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '18px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  profileIcon: {
    fontSize: '16px'
  },
  chevron: {
    fontSize: '12px',
    transition: 'transform 0.3s ease'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    minWidth: '200px',
    background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(0, 0, 0, 0.95))',
    backdropFilter: 'blur(20px)',
    border: '1px solid #374151',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    zIndex: 9999
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 22px',
    color: '#d1d5db',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '16px'
  },
  dropdownIcon: {
    fontSize: '16px',
    width: '20px'
  },
  dropdownSeparator: {
    height: '1px',
    background: '#374151',
    margin: '4px 0'
  },
  mobileMenuButton: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.8), rgba(17, 24, 39, 0.8))',
    color: 'white',
    padding: '12px',
    border: '1px solid #374151',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    width: '48px',
    height: '48px'
  },
  mobileMenu: {
    position: 'fixed',
    top: '90px',
    left: 0,
    right: 0,
    background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.98), rgba(0, 0, 0, 0.98))',
    backdropFilter: 'blur(20px)',
    border: '1px solid #374151',
    borderTop: 'none',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    zIndex: 9998
  },
  mobileMenuContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    textDecoration: 'none',
    color: '#d1d5db',
    padding: '16px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '16px',
    fontWeight: '500'
  },
  mobileLinkIcon: {
    fontSize: '16px',
    width: '24px'
  },
  mobileDivider: {
    height: '1px',
    background: '#374151',
    margin: '12px 0'
  }
}

export default Navbar