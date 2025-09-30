import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import SigEditor from './SigEditor'
import Navbar from '../components/Navbar'

// Professional SVG Icons
const User = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const Edit = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const Mail = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Shield = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Eye = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const ToggleOn = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
  </svg>
)

const ToggleOff = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const Trash = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Save = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
  </svg>
)

const MessageCircle = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const SettingsDashboardClean = () => {
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [nameSuccess, setNameSuccess] = useState('')
  const [summarySuccess, setSummarySuccess] = useState('')
  const [signoffSuccess, setSignoffSuccess] = useState('')
  const [monitoringSuccess, setMonitoringSuccess] = useState('')
  const api = import.meta.env.VITE_API_URL
  const [summary, setSummary] = useState(null)
  const [signoff, setSignoff] = useState(null)
  const [name, setName] = useState(null)
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false)

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
        setSignoff(sigData.signature || '')
        // Keep monitoring state as local for testing
      } catch (err) {
        console.error('Error fetching settings data:', err)
        setSummary('')
        setName('')
        setSignoff('')
        // Keep monitoring state as local for testing
      }
    }

    fetchAll()
  }, [])

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (nameSuccess) {
      const timer = setTimeout(() => setNameSuccess(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [nameSuccess])

  useEffect(() => {
    if (summarySuccess) {
      const timer = setTimeout(() => setSummarySuccess(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [summarySuccess])

  useEffect(() => {
    if (signoffSuccess) {
      const timer = setTimeout(() => setSignoffSuccess(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [signoffSuccess])

  useEffect(() => {
    if (monitoringSuccess) {
      const timer = setTimeout(() => setMonitoringSuccess(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [monitoringSuccess])

  const updateName = async () => {
    setNameSuccess('')
    setError('')
    const res = await fetch(`${api}/user/update-name`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ new_name: name })
    })
    if (res.ok) setNameSuccess('Name updated!')
    else setError('Failed to update name.')
  }

  const updateSummary = async () => {
    setSummarySuccess('')
    setError('')
    await fetch(`${api}/update-brand-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ summary })
    })
    setSummarySuccess('Brand summary updated!')
  }

  const updateSignoff = async () => {
    setSignoffSuccess('')
    setError('')
    
    // Test: Always show success message for testing placement
    setSignoffSuccess('Sign off updated! (Test Message)')
    
    // Commented out for testing
    // await fetch(`${api}/signature`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include',
    //   body: JSON.stringify({ signature: signoff })
    // })
    // setSignoffSuccess('Sign off updated!')
  }

  const toggleMonitoring = () => {
    setMonitoringSuccess('')
    setError('')
    
    // Simple local toggle for testing
    setIsMonitoringEnabled(!isMonitoringEnabled)
    
    // Show success message
    if (!isMonitoringEnabled) {
      setMonitoringSuccess('Email monitoring enabled')
    } else {
      setMonitoringSuccess('Email monitoring disabled')
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

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <style>
        {`
          @media (min-width: 1024px) and (max-width: 1400px) {
            .settings-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (min-width: 1400px) {
            .settings-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}
      </style>
      <Navbar />
      
      {/* Header */}
      <motion.div
        className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full mx-auto text-center px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'min(95vw, 1400px)' }}>
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Settings
          </motion.h1>
          <motion.p
            className="text-gray-600 text-lg sm:text-xl mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Manage your account and preferences
          </motion.p>
          <motion.div
            className="w-24 h-1 bg-amethyst-500 mx-auto rounded-full"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="w-full mx-auto p-4 sm:p-6 lg:p-8"
        style={{ maxWidth: 'min(95vw, 1400px)' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Main Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 settings-grid">
          {/* User Profile Card */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm lg:col-span-2"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-amethyst-500/10 rounded-xl flex items-center justify-center">
                <User />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">User Profile</h3>
                <p className="text-gray-600 text-sm">Manage your personal information</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Your Name</label>
                <input
                  type="text"
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amethyst-400 focus:border-transparent"
                />
              </div>
              <Button onClick={updateName} className="w-full">
                Update Name
              </Button>
              {nameSuccess && (
                <motion.div
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Save />
                  <span>{nameSuccess}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Brand Summary Card */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm lg:col-span-2"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-light_cyan-500/10 rounded-xl flex items-center justify-center">
                <Edit />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Brand Summary</h3>
                <p className="text-gray-600 text-sm">Tell the AI about your business</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Business Description</label>
                <textarea
                  value={summary || ''}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amethyst-400 focus:border-transparent resize-none"
                  placeholder="Describe your business, tone, and guidelines..."
                />
              </div>
              <Button onClick={updateSummary} className="w-full">
                Save Summary
              </Button>
              {summarySuccess && (
                <motion.div
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Save />
                  <span>{summarySuccess}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Email Sign Off Card */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm lg:col-span-2 flex flex-col self-start"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue_violet-500/10 rounded-xl flex items-center justify-center">
                <Mail />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Email Sign Off</h3>
                <p className="text-gray-600 text-sm">Customize your email sign off</p>
              </div>
            </div>
            
            <div>
              {signoff !== null && signoff !== undefined ? (
                <SigEditor
                  key="signoff-editor"
                  value={signoff}
                  setValue={setSignoff}
                  onBack={null}
                  onSave={updateSignoff}
                  showHeader={false}
                  compact={true}
                />
              ) : (
                <div className="min-h-[200px] flex items-center justify-center text-gray-400">
                  Loading sign off editor...
                </div>
              )}
              
              {signoffSuccess && (
                <motion.div
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Save />
                  <span>{signoffSuccess}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Monitoring Control Card */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm lg:col-span-2"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-amaranth_pink-500/10 rounded-xl flex items-center justify-center">
                <Eye />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Email Monitoring</h3>
                <p className="text-gray-600 text-sm">Control AI email assistance</p>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Control whether Larynx AI monitors your inbox for new emails and generates automatic drafts.
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {isMonitoringEnabled ? 'Monitoring Enabled' : 'Monitoring Disabled'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isMonitoringEnabled ? 'AI is actively monitoring your emails' : 'AI monitoring is turned off'}
                  </div>
                </div>
                <button
                  onClick={toggleMonitoring}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isMonitoringEnabled 
                      ? 'bg-green-400 focus:ring-green-400' 
                      : 'bg-red-400 focus:ring-red-400'
                  }`}
                >
                  <div
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                      isMonitoringEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                    style={{
                      left: '2px'
                    }}
                  />
                </button>
              </div>
              {monitoringSuccess && (
                <motion.div
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Save />
                  <span>{monitoringSuccess}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Account Management Card */}
          <motion.div
            className="bg-white rounded-xl border border-red-200 p-8 shadow-sm lg:col-span-2"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Shield />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Account Management</h3>
                <p className="text-gray-600 text-sm">Manage your account settings</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-red-600 mb-3">Delete Account</h4>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  This action cannot be undone. This will permanently delete your account and all associated data.
                </p>
                <Button
                  onClick={deleteAccount}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash />
                  <span className="ml-2">Delete Account</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Global Error Message */}
        {error && (
          <motion.div
            className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SettingsDashboardClean
