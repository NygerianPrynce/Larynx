import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import SigEditor from './SigEditor'
import Navbar from '../components/Navbar'

// Custom SVG Icons with improved styling
const User = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const Edit = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Mail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Shield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Eye = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOff = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 3l18 18" />
  </svg>
)

const Trash = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Save = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const MessageCircle = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const SettingsPageModern = () => {
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
      } catch (err) {
        console.error('Error fetching settings data:', err)
        setSummary('')
        setName('')
        setSignoff('')
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
    await fetch(`${api}/signature`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ signature: signoff })
    })
    setSignoffSuccess('Sign off updated!')
  }

  const stopMonitoring = async () => {
    setMonitoringSuccess('')
    setError('')
    const confirmStop = window.confirm(
      '⚠️ WARNING: If you stop monitoring, you will no longer receive email drafts or alerts. Your AI assistant will be DISABLED.\n\nAre you absolutely sure you want to do this?'
    )
    if (!confirmStop) return

    const res = await fetch(`${api}/stop-monitoring`, {
      method: 'POST',
      credentials: 'include'
    })

    if (res.ok) setMonitoringSuccess('Monitoring stopped!')
    else setError('Failed to stop monitoring.')
  }

  const startMonitoring = async () => {
    const res = await fetch(`${api}/start-monitoring`, {
      method: 'POST',
      credentials: 'include'
    })
    if (res.ok) {
      setMonitoringSuccess('Monitoring re-enabled!')
    } else {
      setError('Failed to start monitoring.')
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
    <div className="min-h-screen bg-seasalt-500">
      {/* Subtle Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }}></div>

      <Navbar />
      
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.h1
            className="text-6xl font-bold mb-6 text-seasalt-100 tracking-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Settings
          </motion.h1>
          <motion.div
            className="w-24 h-1 bg-amethyst-500 mx-auto mb-6"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.p
            className="text-lg text-seasalt-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Customize your AI assistant and manage your account preferences
          </motion.p>
        </motion.div>

        {/* Feedback Banner */}
        <motion.div
          className="flex items-center justify-between p-8 bg-white rounded-xl border border-seasalt-200/50 shadow-sm mb-12"
          variants={itemVariants}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center gap-6 flex-1">
            <div className="w-12 h-12 bg-amethyst-500/10 rounded-lg flex items-center justify-center">
              <MessageCircle />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-seasalt-100 mb-2">Your Feedback Matters</h3>
              <p className="text-seasalt-300 text-sm leading-relaxed">
                Help us improve Larynx AI by sharing your thoughts, suggestions, or reporting any issues.
              </p>
            </div>
          </div>
          <motion.a
            href="mailto:larynxai.official@gmail.com"
            className="px-6 py-3 bg-amethyst-500 hover:bg-amethyst-600 text-white rounded-lg font-medium transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact Us
          </motion.a>
        </motion.div>

        {/* Global Error Message */}
        {error && (
          <motion.div
            className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <span>{error}</span>
          </motion.div>
        )}

        {/* User Profile Section */}
        <motion.div className="mb-12" variants={itemVariants}>
          <motion.div className="flex items-center gap-4 mb-8" variants={itemVariants}>
            <div className="w-10 h-10 bg-amethyst-500/10 rounded-lg flex items-center justify-center">
              <User />
            </div>
            <h2 className="text-2xl font-bold text-seasalt-100">User Profile</h2>
          </motion.div>
          <motion.div
            className="p-8 bg-white rounded-xl border border-seasalt-200/50 shadow-sm"
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold text-seasalt-100 mb-3">Your Name</label>
              <input
                type="text"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-seasalt-500/5 border border-seasalt-200/60 rounded-lg text-seasalt-100 placeholder-seasalt-300 focus:outline-none focus:ring-2 focus:ring-amethyst-400 focus:border-amethyst-400 transition-all duration-200"
              />
            </div>
            <Button onClick={updateName} className="w-full sm:w-auto">
              Update Name
            </Button>
            
            {nameSuccess && (
              <motion.div
                className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Save />
                <span>{nameSuccess}</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Brand Summary Section */}
        <motion.div className="mb-12" variants={itemVariants}>
          <motion.div className="flex items-center gap-4 mb-8" variants={itemVariants}>
            <div className="w-10 h-10 bg-light_cyan-500/10 rounded-lg flex items-center justify-center">
              <Edit />
            </div>
            <h2 className="text-2xl font-bold text-seasalt-100">Brand Summary</h2>
          </motion.div>
          <motion.div
            className="p-8 bg-white rounded-xl border border-seasalt-200/50 shadow-sm"
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold text-seasalt-100 mb-3">Tell the AI about your business</label>
              <textarea
                value={summary || ''}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full min-h-[120px] px-4 py-3 bg-seasalt-500/5 border border-seasalt-200/60 rounded-lg text-seasalt-100 placeholder-seasalt-300 focus:outline-none focus:ring-2 focus:ring-amethyst-400 focus:border-amethyst-400 transition-all duration-200 resize-vertical"
                placeholder="Describe your business, tone, and any specific guidelines for email communication..."
              />
            </div>
            <Button onClick={updateSummary} className="w-full sm:w-auto">
              Save Summary
            </Button>
            
            {summarySuccess && (
              <motion.div
                className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Save />
                <span>{summarySuccess}</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Email Sign Off Section */}
        <motion.div className="mb-12" variants={itemVariants}>
          <motion.div className="flex items-center gap-4 mb-8" variants={itemVariants}>
            <div className="w-10 h-10 bg-blue_violet-500/10 rounded-lg flex items-center justify-center">
              <Mail />
            </div>
            <h2 className="text-2xl font-bold text-seasalt-100">Email Sign Off</h2>
          </motion.div>
          <motion.div
            className="p-8 bg-white rounded-xl border border-seasalt-200/50 shadow-sm"
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            {signoff !== null && signoff !== undefined ? (
              <SigEditor
                key={`signoff-${signoff.length}`}
                value={signoff}
                setValue={setSignoff}
                onBack={null}
                onSave={updateSignoff}
              />
            ) : (
              <div className="min-h-[200px] flex items-center justify-center text-seasalt-300">
                Loading sign off editor...
              </div>
            )}
            
            {signoffSuccess && (
              <motion.div
                className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Save />
                <span>{signoffSuccess}</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Monitoring Control Section */}
        <motion.div className="mb-12" variants={itemVariants}>
          <motion.div className="flex items-center gap-4 mb-8" variants={itemVariants}>
            <div className="w-10 h-10 bg-amaranth_pink-500/10 rounded-lg flex items-center justify-center">
              <Eye />
            </div>
            <h2 className="text-2xl font-bold text-seasalt-100">Email Monitoring</h2>
          </motion.div>
          <motion.div
            className="p-8 bg-white rounded-xl border border-seasalt-200/50 shadow-sm"
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="mb-6">
              <p className="text-seasalt-300 text-sm leading-relaxed">
                Control whether Larynx AI monitors your inbox for new emails and generates automatic drafts.
              </p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={startMonitoring} variant="default" className="flex items-center gap-2">
                <Eye />
                <span>Start Monitoring</span>
              </Button>
              <Button onClick={stopMonitoring} variant="secondary" className="flex items-center gap-2">
                <EyeOff />
                <span>Stop Monitoring</span>
              </Button>
            </div>
            
            {monitoringSuccess && (
              <motion.div
                className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Save />
                <span>{monitoringSuccess}</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Account Management Section */}
        <motion.div className="mb-12" variants={itemVariants}>
          <motion.div className="flex items-center gap-4 mb-8" variants={itemVariants}>
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Shield />
            </div>
            <h2 className="text-2xl font-bold text-seasalt-100">Account Management</h2>
          </motion.div>
          <motion.div
            className="p-8 bg-white rounded-xl border border-red-200/50 shadow-sm flex justify-between items-center gap-6 flex-wrap"
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-seasalt-300 text-sm leading-relaxed">
                This action cannot be undone. This will permanently delete your account and all associated data.
              </p>
            </div>
            <Button
              onClick={deleteAccount}
              variant="destructive"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Trash />
              <span>Delete Account</span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SettingsPageModern
