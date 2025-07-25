// File: pages/SettingsPage.jsx
import React, { useEffect, useState } from 'react'
import SigEditor from './SigEditor'

import Navbar from '../components/Navbar'

// Custom SVG Icons
const User = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const Edit = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Mail = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Shield = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Eye = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOff = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
)

const Trash = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Save = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const SettingsPage = () => {
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [particles, setParticles] = useState([])
  const api = import.meta.env.VITE_API_URL
  const [summary, setSummary] = useState('')
  const [signature, setSignature] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    // Generate floating particles
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 40; i++) {
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
    const fetchAll = async () => {
      try {
        const [summaryRes, nameRes, sigRes] = await Promise.all([
          fetch(`${api}/get-brand-summary`, { credentials: 'include' }),
          fetch(`${api}/user/name`, { credentials: 'include' }),
          fetch(`${api}/signature`, { credentials: 'include' }),
        ])

        const summaryData = await summaryRes.json()
        const nameData = await nameRes.json()
        const sigData = await sigRes.json()

        setSummary(summaryData.summary || '')
        setName(nameData.name || '')
        setSignature(sigData.signature || '')
      } catch (err) {
        console.error('Error fetching settings data:', err)
      }
    }

    fetchAll()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const updateName = async () => {
    setSuccess('')
    setError('')
    const res = await fetch(`${api}/user/update-name`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ new_name: name })
    })
    if (res.ok) setSuccess('✅ Name updated!')
    else setError('❌ Failed to update name.')
  }

  const updateSummary = async () => {
    setSuccess('')
    setError('')
    await fetch(`${api}/update-brand-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ summary })
    })
    setSuccess('✅ Brand summary updated!')
  }

  const updateSignature = async () => {
    setSuccess('')
    setError('')
    await fetch(`${api}/signature`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ signature })
    })
    setSuccess('✅ Signature updated!')
  }

  const stopMonitoring = async () => {
    setSuccess('')
    setError('')
    const confirmStop = window.confirm(
      '⚠️ WARNING: If you stop monitoring, you will no longer receive email drafts or alerts. Your AI assistant will be DISABLED.\n\nAre you absolutely sure you want to do this?'
    )
    if (!confirmStop) return

    const res = await fetch(`${api}/stop-monitoring`, {
      method: 'POST',
      credentials: 'include'
    })

    if (res.ok) setSuccess('✅ Monitoring stopped!')
    else setError('❌ Failed to stop monitoring.')
  }

  const startMonitoring = async () => {
    const res = await fetch(`${api}/start-monitoring`, {
      method: 'POST',
      credentials: 'include'
    })
    if (res.ok) {
      setSuccess('✅ Monitoring re-enabled!')
    } else {
      setError('❌ Failed to start monitoring.')
    }
  }

  const deleteAccount = async () => {
    const confirm = window.confirm('Are you sure? This will permanently delete your account.')
    if (!confirm) return

    await fetch(`${api}/user/delete`, {
      method: 'DELETE',
      credentials: 'include'
    })
    window.location.href = '/'
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
          
          .primary-button:hover {
            transform: scale(1.02) !important;
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
          }
          
          .secondary-button:hover {
            background: rgba(59, 130, 246, 0.9) !important;
            transform: scale(1.02) !important;
          }
          
          .danger-button:hover {
            background: rgba(220, 38, 38, 0.9) !important;
            transform: scale(1.02) !important;
          }
          
          .success-button:hover {
            background: rgba(16, 185, 129, 0.9) !important;
            transform: scale(1.02) !important;
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
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>
            Customize your AI assistant and manage your account preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={styles.successMessage}>
            <Save />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div style={styles.errorMessage}>
            <span>{error}</span>
          </div>
        )}

        {/* User Profile Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <User />
            <h2 style={styles.sectionTitle}>User Profile</h2>
          </div>
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={styles.input}
              />
            </div>
            <button 
              onClick={updateName}
              style={styles.primaryButton}
              className="primary-button"
            >
              Update Name
            </button>
          </div>
        </div>

        {/* Brand Summary Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Edit />
            <h2 style={styles.sectionTitle}>Brand Summary</h2>
          </div>
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tell the AI about your business</label>
              <textarea 
                value={summary} 
                onChange={(e) => setSummary(e.target.value)} 
                style={styles.textarea}
                placeholder="Describe your business, tone, and any specific guidelines for email communication..."
              />
            </div>
            <button 
              onClick={updateSummary}
              style={styles.primaryButton}
              className="primary-button"
            >
              Save Summary
            </button>
          </div>
        </div>

        {/* Email Signature Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Mail />
            <h2 style={styles.sectionTitle}>Email Signature</h2>
          </div>
          <div style={styles.card}>
            <SigEditor
              value={signature}
              setValue={setSignature}
              onBack={() => {}}
              onSave={updateSignature}
            />
          </div>
        </div>

        {/* Monitoring Control Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Eye />
            <h2 style={styles.sectionTitle}>Email Monitoring</h2>
          </div>
          <div style={styles.card}>
            <div style={styles.monitoringInfo}>
              <p style={styles.infoText}>
                Control whether Larynx AI monitors your inbox for new emails and generates automatic drafts.
              </p>
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={startMonitoring}
                style={styles.successButton}
                className="success-button"
              >
                <Eye />
                <span>Start Monitoring</span>
              </button>
              <button
                onClick={stopMonitoring}
                style={styles.secondaryButton}
                className="secondary-button"
              >
                <EyeOff />
                <span>Stop Monitoring</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Shield />
            <h2 style={styles.sectionTitle}>Account Management</h2>
          </div>
          <div style={styles.dangerCard}>
            <div style={styles.dangerInfo}>
              <h3 style={styles.dangerTitle}>Danger Zone</h3>
              <p style={styles.dangerText}>
                This action cannot be undone. This will permanently delete your account and all associated data.
              </p>
            </div>
            <button
              onClick={deleteAccount}
              style={styles.dangerButton}
              className="danger-button"
            >
              <Trash />
              <span>Delete Account</span>
            </button>
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
    padding: '48px 0'
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
  section: {
    marginBottom: '48px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white'
  },
  card: {
    padding: '32px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid #374151'
  },
  dangerCard: {
    padding: '32px',
    background: 'linear-gradient(145deg, rgba(127, 29, 29, 0.3), rgba(69, 10, 10, 0.3))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap'
  },
  inputGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#e5e7eb',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '16px',
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    resize: 'vertical'
  },
  primaryButton: {
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  successButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#10b981',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  dangerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#dc2626',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  monitoringInfo: {
    marginBottom: '24px'
  },
  infoText: {
    color: '#d1d5db',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  dangerInfo: {
    flex: 1
  },
  dangerTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fca5a5',
    marginBottom: '8px'
  },
  dangerText: {
    color: '#fca5a5',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px'
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: 'rgba(220, 38, 38, 0.2)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '12px',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px'
  }
}

export default SettingsPage