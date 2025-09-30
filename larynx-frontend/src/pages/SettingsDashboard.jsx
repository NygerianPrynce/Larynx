import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import SigEditor from './SigEditor'

// Custom SVG Icons
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

const SettingsDashboard = () => {
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        className="w-64 bg-amethyst-500 text-white flex flex-col"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-amethyst-400/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-amethyst-500 rounded-full"></div>
            </div>
            <span className="text-xl font-bold">Larynx AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg">
              <Shield />
              <span className="font-medium">Settings</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
              <User />
              <span>Profile</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
              <Eye />
              <span>Monitoring</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
              <Mail />
              <span>Email</span>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-amethyst-400/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User />
            </div>
            <div>
              <div className="text-sm font-medium">User Account</div>
              <div className="text-xs text-white/70">Admin</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          className="bg-white border-b border-gray-200 px-8 py-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search settings..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amethyst-400 focus:border-transparent"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="flex-1 p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="bg-amethyst-500 text-white p-6 rounded-xl"
              variants={itemVariants}
            >
              <div className="text-sm opacity-90 mb-1">Account Status</div>
              <div className="text-2xl font-bold">Active</div>
            </motion.div>
            <motion.div
              className="bg-white p-6 rounded-xl border border-gray-200"
              variants={itemVariants}
            >
              <div className="text-sm text-gray-600 mb-1">Email Monitoring</div>
              <div className="text-2xl font-bold text-gray-900">Enabled</div>
            </motion.div>
            <motion.div
              className="bg-amaranth_pink-500 text-white p-6 rounded-xl"
              variants={itemVariants}
            >
              <div className="text-sm opacity-90 mb-1">Sign Off</div>
              <div className="text-2xl font-bold">Configured</div>
            </motion.div>
            <motion.div
              className="bg-white p-6 rounded-xl border border-gray-200"
              variants={itemVariants}
            >
              <div className="text-sm text-gray-600 mb-1">Brand Summary</div>
              <div className="text-2xl font-bold text-gray-900">Complete</div>
            </motion.div>
          </div>

          {/* Main Settings Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Profile Card */}
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amethyst-500/10 rounded-lg flex items-center justify-center">
                  <User />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amethyst-400 focus:border-transparent"
                  />
                </div>
                <Button onClick={updateName} className="w-full">
                  Update Name
                </Button>
                {nameSuccess && (
                  <motion.div
                    className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
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
              className="bg-white rounded-xl border border-gray-200 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-light_cyan-500/10 rounded-lg flex items-center justify-center">
                  <Edit />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Brand Summary</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                  <textarea
                    value={summary || ''}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amethyst-400 focus:border-transparent resize-none"
                    placeholder="Describe your business, tone, and guidelines..."
                  />
                </div>
                <Button onClick={updateSummary} className="w-full">
                  Save Summary
                </Button>
                {summarySuccess && (
                  <motion.div
                    className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
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
              className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue_violet-500/10 rounded-lg flex items-center justify-center">
                  <Mail />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Email Sign Off</h3>
              </div>
              <div className="space-y-4">
                {signoff !== null && signoff !== undefined ? (
                  <SigEditor
                    key={`signoff-${signoff.length}`}
                    value={signoff}
                    setValue={setSignoff}
                    onBack={null}
                    onSave={updateSignoff}
                  />
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center text-gray-400">
                    Loading sign off editor...
                  </div>
                )}
                {signoffSuccess && (
                  <motion.div
                    className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
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
              className="bg-white rounded-xl border border-gray-200 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amaranth_pink-500/10 rounded-lg flex items-center justify-center">
                  <Eye />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Email Monitoring</h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Control whether Larynx AI monitors your inbox for new emails and generates automatic drafts.
                </p>
                <div className="flex gap-3">
                  <Button onClick={startMonitoring} className="flex-1">
                    <Eye />
                    <span className="ml-2">Start Monitoring</span>
                  </Button>
                  <Button onClick={stopMonitoring} variant="secondary" className="flex-1">
                    <EyeOff />
                    <span className="ml-2">Stop Monitoring</span>
                  </Button>
                </div>
                {monitoringSuccess && (
                  <motion.div
                    className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
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
              className="bg-white rounded-xl border border-red-200 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Shield />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Account Management</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Danger Zone</h4>
                  <p className="text-gray-600 text-sm mb-4">
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
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsDashboard
