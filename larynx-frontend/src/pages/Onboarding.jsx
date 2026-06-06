import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Edit, Mail, Package, Shield, ArrowRight, AlertTriangle, CheckCircle, Loader2, LogOut } from 'lucide-react'
import OnboardingInventory from './OnboardingInventory'
import SigEditor from './SigEditor'

const Onboarding = () => {
  const navigate = useNavigate()

  const showNotification = (message, type = 'info', duration = 4000) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
  }

  // Let a user bail out of onboarding without finishing. We log out so the
  // half-finished session is cleared and they land cleanly on the public page.
  // Whatever a step already persisted stays; onboarding just isn't marked complete.
  const handleExitOnboarding = async () => {
    setShowExitConfirm(false)
    try {
      await fetch(`${api}/logout`, { method: 'POST', credentials: 'include' })
    } catch (e) {
      // Leaving regardless — ignore network errors on logout.
    }
    window.location.href = '/'
  }

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false)
    
    try {
      const res = await fetch(`${api}/user/delete`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (res.ok) {
        showNotification('Your account has been deleted. Goodbye 🫡', 'success')
        setTimeout(() => window.location.href = '/', 2000)
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      showNotification('Failed to delete account. Please try again.', 'error')
    }
  }

  const [hasWebsite, setHasWebsite] = useState(true)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [manualStep, setManualStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('intro')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [brandSummary, setBrandSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [signoff, setSignoff] = useState('')
  const [signatureDetected, setSignatureDetected] = useState(false)
  const [detectedSigHtml, setDetectedSigHtml] = useState('')
  const [sigMode, setSigMode] = useState('editing') // 'choosing' (use detected vs new) | 'editing'
  const [emailCrawlMessages, setEmailCrawlMessages] = useState([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [error, setError] = useState(null)
  const [brandInfo, setBrandInfo] = useState({
    brand_name: '',
    business_description: '',
    target_audience: '',
    industry: '',
    business_mission: '',
    key_differentiators: '',
    service_area: '',
    policies: '',
    booking_process: ''
  })

  const api = import.meta.env.VITE_API_URL

  // Error handling wrapper
  const handleAsyncOperation = async (operation, errorMessage = "Something went wrong") => {
    try {
      setError(null)
      return await operation()
    } catch (err) {
      console.error('Onboarding error:', err)
      
      if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        setError("Connection timeout - please check your internet and try again")
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError("Your session has expired. Please log in again.")
        setTimeout(() => navigate('/login'), 3000)
        return
      } else if (err.message?.includes('403')) {
        navigate('/error/403')
        return
      } else if (err.message?.includes('500') || err.message?.includes('Server')) {
        navigate('/error/500')
        return
      } else {
        setError(errorMessage)
      }
      throw err
    }
  }

  // When the user reaches the signoff step, pre-fill the editor with the signature
  // we auto-detected from their sent emails during the crawl (if any). Lets them
  // confirm/tweak instead of writing from scratch — or skip entirely.
  useEffect(() => {
    if (step !== 'signoff') return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${api}/signature`, { credentials: 'include' })
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (data.signature && data.signature.trim()) {
          setSignatureDetected(true)
          setDetectedSigHtml(data.signature_html || '')
          setSignoff(prev => (prev && prev.trim()) ? prev : data.signature)
          setSigMode('choosing')   // offer "use this vs create new" before the editor
        }
      } catch (e) {
        // non-critical — they can just type a signature
      }
    })()
    return () => { cancelled = true }
  }, [step])

  // Auto-clear errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Auto-redirect after finalizing step
  useEffect(() => {
    if (step === 'finalizing') {
      const timer = setTimeout(() => {
        navigate('/home')
      }, 3000) // Redirect after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [step, navigate])

  const manualSteps = [
    { key: 'brand_name', label: "What's your brand name?", type: 'input', min: 1, max: 200 },
    { key: 'business_description', label: 'What does your business do?', type: 'textarea', min: 10, max: 1000 },
    { key: 'target_audience', label: 'Who are your ideal customers?', type: 'textarea', min: 5, max: 500 },
    { key: 'industry', label: 'What industry are you in?', type: 'input', min: 2, max: 100 },
    { key: 'business_mission', label: "What's your company's mission? (Optional)", type: 'textarea', optional: true, max: 500 },
    { key: 'key_differentiators', label: 'What makes you different? (Optional)', type: 'textarea', optional: true, max: 1000 },
    { key: 'service_area', label: 'Where do you operate or deliver to? (Optional)', type: 'textarea', optional: true, max: 500 },
    { key: 'policies', label: 'Any key policies? e.g. deposits, minimums, cancellation, hours (Optional)', type: 'textarea', optional: true, max: 1000 },
    { key: 'booking_process', label: 'How do customers book or order from you? (Optional)', type: 'textarea', optional: true, max: 500 }
  ]

  const crawlMessages = [
    'Connecting to your email...',
    'Analyzing your writing style...',
    'Learning your communication patterns...',
    'Understanding your tone and voice...',
    'Processing email templates...',
    'Almost done...'
  ]

  const monitoringMessages = [
    'Setting up email monitoring...',
    'Configuring AI responses...',
    'Finalizing your setup...'
  ]

  const deleteAccountMessages = [
    'Deleting your account...',
    'Removing all data...',
    'Goodbye...'
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const getStepIcon = () => {
    switch (step) {
      case 'intro': return <Globe className="w-8 h-8" />
      case 'brandSummary': return <Edit className="w-8 h-8" />
      case 'tone': return <Mail className="w-8 h-8" />
      case 'signoff': return <Edit className="w-8 h-8" />
      case 'inventory': return <Package className="w-8 h-8" />
      case 'monitoringConsent': return <Shield className="w-8 h-8" />
      case 'finalizing': return <CheckCircle className="w-8 h-8" />
      default: return <Globe className="w-8 h-8" />
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'intro': return hasWebsite ? 'Website Analysis' : 'Business Information'
      case 'brandSummary': return 'Review Brand Summary'
      case 'tone': return 'Email Tone Analysis'
      case 'signoff': return 'Email Sign Off'
      case 'inventory': return 'Product Catalog'
      case 'monitoringConsent': return 'Final Setup'
      case 'finalizing': return 'Welcome to Larynx AI!'
      default: return 'Setup'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'intro': return hasWebsite ? "We'll analyze your website to understand your business" : "Tell us about your business"
      case 'brandSummary': return "Review and edit the brand summary we generated from your website"
      case 'tone': return "We'll analyze your email tone and writing style"
      case 'signoff': return "Create a professional email sign off that matches your brand. Use the toolbar below to format your text."
      case 'inventory': return "Add your products and services"
      case 'monitoringConsent': return "Enable email monitoring to get started"
      case 'finalizing': return "Your AI email assistant is ready!"
      default: return "Let's set up your AI email assistant"
    }
  }

  const getStepProgress = () => {
    const steps = ['intro', 'brandSummary', 'tone', 'signoff', 'inventory', 'monitoringConsent', 'finalizing']
    const currentIndex = steps.indexOf(step)
    return ((currentIndex + 1) / steps.length) * 100
  }

  const transitionToStep = (newStep) => {
      setIsTransitioning(true)
      setTimeout(() => {
        setStep(newStep)
        setIsTransitioning(false)
      }, 300)
  }

  const setLoadingState = (loading, messages = []) => {
    setIsLoading(loading)
    if (loading && messages.length > 0) {
      setEmailCrawlMessages(messages)
      setCurrentMessageIndex(0)
    }
  }

  // Cycle through loading messages
  useEffect(() => {
    if (isLoading && emailCrawlMessages.length > 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % emailCrawlMessages.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isLoading, emailCrawlMessages.length])

  // Animate the progress ring. We don't get real progress from the backend, so we
  // ease toward ~92% over time (fast at first, slowing as it climbs) and snap to
  // 100% the moment the operation actually finishes. Gives an impatient user a
  // sense of motion without ever lying that it's done.
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0)
      const start = Date.now()
      // Ease toward ~92% over RAMP_MS, then hold until the op actually completes.
      // To change how slow the bar feels, just adjust RAMP_MS (currently ~16s).
      const RAMP_MS = 16000
      const interval = setInterval(() => {
        const elapsed = Date.now() - start
        const pct = 92 * (1 - Math.exp(-3.5 * elapsed / RAMP_MS))
        setLoadingProgress(Math.min(92, pct))
      }, 100)
      return () => clearInterval(interval)
    } else {
      // Operation finished — fill to 100%, then reset shortly after.
      setLoadingProgress(100)
      const t = setTimeout(() => setLoadingProgress(0), 600)
      return () => clearTimeout(t)
    }
  }, [isLoading])

  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) {
      setErrors({ ...errors, websiteUrl: 'Please enter a valid website URL' })
      return
    }

    await handleAsyncOperation(async () => {
      setLoadingState(true, [
        'Analyzing your website...',
        'Understanding your brand...',
        'Learning your business model...',
        'Processing content...'
      ])
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      try {
        // Ensure URL has protocol
        let urlToScrape = websiteUrl.trim()
        if (!urlToScrape.startsWith('http://') && !urlToScrape.startsWith('https://')) {
          urlToScrape = `https://${urlToScrape}`
        }
        
        const response = await fetch(`${api}/website-scrape?url=${encodeURIComponent(urlToScrape)}`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Website analysis failed (${response.status})`)
        }

        const data = await response.json()
        setBrandSummary(data.summary || 'Analysis complete')
        setStep('brandSummary')
      } finally {
        clearTimeout(timeoutId)
        setLoadingState(false)
      }
    }, "Failed to analyze website. Please try again.")
  }

  const handleManualSubmit = async () => {
    const currentStepData = manualSteps[manualStep]
    const value = brandInfo[currentStepData.key]

    if (!currentStepData.optional && (!value || value.length < currentStepData.min)) {
      setErrors({ ...errors, [currentStepData.key]: `Please enter at least ${currentStepData.min} characters` })
      return
    }

    if (value && value.length > currentStepData.max) {
      setErrors({ ...errors, [currentStepData.key]: `Please keep it under ${currentStepData.max} characters` })
        return
      }

    if (manualStep < manualSteps.length - 1) {
      setManualStep(manualStep + 1)
      setErrors({})
      return
    }

    // Final step — persist the brand info to the backend (summary + retrievable facts).
    // Optional empty fields are sent as null so they're simply skipped server-side.
    await handleAsyncOperation(async () => {
      setLoadingState(true, ['Saving your business info...', 'Building your brand profile...'])
      try {
        const response = await fetch(`${api}/upload-brand-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            brand_name: brandInfo.brand_name,
            business_description: brandInfo.business_description,
            target_audience: brandInfo.target_audience,
            industry: brandInfo.industry,
            business_mission: brandInfo.business_mission || null,
            key_differentiators: brandInfo.key_differentiators || null,
            service_area: brandInfo.service_area || null,
            policies: brandInfo.policies || null,
            booking_process: brandInfo.booking_process || null,
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to save business info (${response.status})`)
        }

        const data = await response.json()
        setBrandSummary(data.summary || Object.values(brandInfo).filter(Boolean).join(' '))
        transitionToStep('tone')
      } finally {
        setLoadingState(false)
      }
    }, "Failed to save your business info. Please try again.")
  }

  // Persist edits the user made to the scraped brand summary before moving on.
  // Non-blocking: the original scraped summary is already saved server-side, so even
  // if this save fails we still let them continue.
  const saveScrapedSummary = async () => {
    try {
      await fetch(`${api}/update-brand-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ summary: brandSummary })
      })
    } catch (e) {
      console.warn('Failed to save brand summary edits, continuing:', e)
    }
    transitionToStep('tone')
  }

  const handleEmailCrawl = async () => {
    await handleAsyncOperation(async () => {
      setLoadingState(true, crawlMessages)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)
      
      try {
        const response = await fetch(`${api}/crawl-emails`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Email crawl failed (${response.status})`)
        }
        
        transitionToStep('signoff')
      } finally {
        clearTimeout(timeoutId)
        setLoadingState(false)
      }
    }, "Failed to analyze emails. Please try again.")
  }

  const handleGenericTone = () => {
    transitionToStep('signoff')
  }

  const updateSignoff = async (content) => {
    await handleAsyncOperation(async () => {
      const api = import.meta.env.VITE_API_URL
      
      try {
        const response = await fetch(`${api}/signature`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ signature: content })
        })
        
        if (!response.ok) {
          throw new Error(`Failed to save signoff (${response.status})`)
        }
        
        setSignoff(content)
        transitionToStep('inventory')
      } catch (error) {
        console.error('Error saving signoff:', error)
        throw error
      }
    }, "Failed to save signoff. Please try again.")
  }

  return (
    <>
    <div 
      className="min-h-screen bg-white"
      style={{ width: '100vw', maxWidth: '100%' }}
    >
      {/* Exit Setup button — always available so a user can leave onboarding */}
      <button
        onClick={() => setShowExitConfirm(true)}
        disabled={isLoading}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white/90 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm disabled:opacity-50"
      >
        <LogOut size={16} />
        <span>Exit setup</span>
      </button>

      {/* Error Banner */}
      {error && (
        <motion.div 
          className="fixed top-0 left-0 right-0 bg-red-500 text-white px-6 py-3 text-center z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
          <button 
            onClick={() => setError(null)}
              className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Circular progress ring — fills as the operation runs */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                {/* track */}
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#e5e7eb" strokeWidth="8"
                />
                {/* progress */}
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#progressGradient)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={(2 * Math.PI * 42) * (1 - loadingProgress / 100)}
                  style={{ transition: 'stroke-dashoffset 0.2s ease-out' }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{Math.round(loadingProgress)}%</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {step === 'tone'
                ? 'Analyzing your emails'
                : step === 'monitoringConsent'
                ? 'Finishing setup'
                : step === 'intro'
                ? (hasWebsite ? 'Analyzing your website' : 'Saving your business info')
                : 'Processing...'}
            </h3>
            
            <div className="h-8 flex items-center justify-center mb-4">
              <AnimatePresence mode="wait">
            {emailCrawlMessages.length > 0 && (
                  <motion.p 
                    key={currentMessageIndex}
                    className="text-gray-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                  {emailCrawlMessages[currentMessageIndex]}
                  </motion.p>
            )}
              </AnimatePresence>
            </div>
            
            {showSuccessMessage && (
              <motion.div 
                className="flex items-center justify-center space-x-2 text-green-600"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Analysis complete!</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
              </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            variants={itemVariants}
          >
            <div className="text-white">
            {getStepIcon()}
          </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            variants={itemVariants}
          >
            {getStepTitle()}
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-600 mb-8"
            variants={itemVariants}
          >
            {getStepDescription()}
          </motion.p>

          {/* Progress Bar */}
          <motion.div 
            className="max-w-md mx-auto"
            variants={itemVariants}
          >
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
        </div>
            <p className="text-sm text-gray-500">
              Step {['intro', 'brandSummary', 'tone', 'signoff', 'inventory', 'monitoringConsent', 'finalizing'].indexOf(step) + 1} of 7
            </p>
          </motion.div>
        </motion.div>

        {/* Step Content */}
        <motion.div 
          className="flex justify-center"
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full max-w-4xl">
            {/* Intro Step */}
          {step === 'intro' && hasWebsite && (
              <motion.div 
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Website URL
                    </label>
                <input
                  type="text"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value)
                    setErrors({ ...errors, websiteUrl: null })
                  }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                    {errors.websiteUrl && (
                      <p className="text-red-500 text-sm mt-2">{errors.websiteUrl}</p>
                    )}
              </div>

                  <motion.button 
                onClick={handleWebsiteSubmit} 
                disabled={isLoading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
              >
                <span>Analyze Website</span>
                    <ArrowRight size={20} />
                  </motion.button>

                  <button 
                    onClick={() => setHasWebsite(false)}
                    disabled={isLoading}
                    className="w-full px-6 py-3 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium text-sm"
              >
                Don't have a website? Fill out manually instead
                  </button>
            </div>
              </motion.div>
          )}

            {/* Manual Input Steps */}
          {step === 'intro' && !hasWebsite && (
              <motion.div 
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {manualSteps[manualStep].label}
                    </h3>
                    {manualSteps[manualStep].type === 'input' ? (
                      <input
                        type="text"
                        value={brandInfo[manualSteps[manualStep].key]}
                        onChange={(e) => {
                          setBrandInfo({ ...brandInfo, [manualSteps[manualStep].key]: e.target.value })
                          setErrors({ ...errors, [manualSteps[manualStep].key]: null })
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <textarea
                        value={brandInfo[manualSteps[manualStep].key]}
                        onChange={(e) => {
                          setBrandInfo({ ...brandInfo, [manualSteps[manualStep].key]: e.target.value })
                          setErrors({ ...errors, [manualSteps[manualStep].key]: null })
                        }}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    )}
                    {errors[manualSteps[manualStep].key] && (
                      <p className="text-red-500 text-sm mt-2">{errors[manualSteps[manualStep].key]}</p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    {manualStep > 0 && (
                      <motion.button 
                        onClick={() => setManualStep(manualStep - 1)}
                        className="flex-1 px-6 py-3 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Back
                      </motion.button>
                    )}
                    
                    <motion.button 
                      onClick={handleManualSubmit}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{manualStep < manualSteps.length - 1 ? 'Next' : 'Continue'}</span>
                      <ArrowRight size={20} />
                    </motion.button>
            </div>
                </div>
              </motion.div>
          )}

            {/* Brand Summary Step */}
          {step === 'brandSummary' && (
              <motion.div 
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Brand Summary Generated</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We've analyzed your website and generated a brand summary. Please review and edit it to ensure it accurately represents your business.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Brand Summary
                    </label>
                <textarea
                  value={brandSummary}
                  onChange={(e) => setBrandSummary(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Your brand summary will appear here..."
                />
              </div>

                  <div className="flex space-x-4">
                    <motion.button 
                      onClick={() => transitionToStep('intro')}
                      className="flex-1 px-6 py-3 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                    
                    <motion.button
                      onClick={saveScrapedSummary}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                    </motion.button>
            </div>
                </div>
              </motion.div>
          )}

            {/* Tone Analysis Step */}
          {step === 'tone' && (
              <motion.div 
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Tone Analysis</h3>
                    <p className="text-gray-600 leading-relaxed">
                  We can analyze your recent emails to understand your writing style, tone, and common phrases.
                  This helps us generate emails that sound authentically like you.
                </p>
              </div>

                  <div className="space-y-4">
                    <motion.button
                  onClick={handleEmailCrawl}
                  disabled={isLoading}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                >
                  <span>Analyze My Emails</span>
                      <ArrowRight size={20} />
                    </motion.button>

                    <motion.button
                  onClick={handleGenericTone}
                  disabled={isLoading}
                      className="w-full px-6 py-3 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                >
                  Skip - Use Default Tone
                    </motion.button>
              </div>
            </div>
              </motion.div>
          )}

            {/* Signature Step */}
          {step === 'signoff' && (
            signatureDetected && sigMode === 'choosing' ? (
              <motion.div
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">We found your email signature</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  We recognized this from your sent emails — logo and all. Use it as-is, or create a new one.
                </p>
                <div className="border border-gray-200 rounded-xl p-4 mb-6 bg-gray-50 overflow-x-auto">
                  {detectedSigHtml
                    ? <div dangerouslySetInnerHTML={{ __html: detectedSigHtml }} />
                    : <pre className="whitespace-pre-wrap text-sm text-gray-800" style={{ fontFamily: 'inherit' }}>{signoff}</pre>}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => { setSignoff(''); setSignatureDetected(false); setSigMode('editing') }}
                    className="flex-1 px-6 py-3 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
                  >
                    Create a new one
                  </button>
                  <button
                    onClick={() => transitionToStep('inventory')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Use this signature
                  </button>
                </div>
              </motion.div>
            ) : (
              <div>
                <SigEditor
                  value={signoff}
                  setValue={setSignoff}
                  onBack={() => transitionToStep('tone')}
                  onSave={updateSignoff}
                  showHeader={false}
                />
                <div className="text-center mt-4">
                  <button
                    onClick={() => transitionToStep('inventory')}
                    className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                  >
                    Skip this step — you can set or change your signature anytime in Settings
                  </button>
                </div>
              </div>
            )
          )}

            {/* Inventory Step */}
          {step === 'inventory' && (
              <motion.div 
                className="bg-white border border-gray-200 rounded-2xl shadow-sm"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
              <OnboardingInventory
                onBack={() => transitionToStep('signoff')}
                onNext={() => transitionToStep('monitoringConsent')}
              />
              </motion.div>
          )}

            {/* Monitoring Consent Step */}
          {step === 'monitoringConsent' && (
              <motion.div 
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Enable Email Monitoring</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                  To provide AI email assistance, we need permission to monitor your inbox for new emails 
                  and draft replies. This is essential for our service to work.
                </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-1">Important Notice</h4>
                          <p className="text-yellow-700 text-sm leading-relaxed">
                    Without email monitoring, we cannot detect new messages or help with responses. 
                    Declining will result in account termination.
                  </p>
                </div>
              </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Delete Account
                    </motion.button>

                    <motion.button
                  onClick={async () => {
                    await handleAsyncOperation(async () => {
                      setLoadingState(true, monitoringMessages)
                      
                      const controller = new AbortController()
                      const timeoutId = setTimeout(() => controller.abort(), 30000)
                      
                      try {
                        const res = await fetch(`${api}/start-monitoring`, {
                          method: 'POST',
                          credentials: 'include',
                          signal: controller.signal
                        })
                        
                        clearTimeout(timeoutId)

                        if (!res.ok) {
                          throw new Error(`Failed to start monitoring (${res.status})`)
                        }
                        
                        setLoadingMessage('Finalizing your setup...')
                        
                        const finishRes = await fetch(`${api}/finish-onboarding`, {
                          method: 'POST',
                          credentials: 'include'
                        })
                        
                        if (!finishRes.ok) {
                          console.warn('Finish onboarding failed, but continuing...')
                        }
                        
                        transitionToStep('finalizing')
                      } finally {
                        clearTimeout(timeoutId)
                        setLoadingState(false)
                      }
                    }, "Failed to enable monitoring. Please try again.")
                  }}
                  disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                >
                  Start Monitoring
                    </motion.button>
              </div>
            </div>
              </motion.div>
          )}

            {/* Finalizing Step */}
          {step === 'finalizing' && (
              <motion.div 
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-6">
                  <div className="text-6xl mb-6">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Larynx AI!</h2>
                  <p className="text-gray-600 leading-relaxed mb-8">
                  Your account is being set up. You'll be redirected to your dashboard shortly.
                </p>
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
              </div>
              </motion.div>
          )}
        </div>
        </motion.div>
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    <AnimatePresence>
      {showDeleteConfirm && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-red-600">⚠️ Delete Account</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  <strong>This action is IRREVERSIBLE.</strong> Are you absolutely sure you want to permanently delete your account and all associated data?
                </p>
                <p className="text-sm text-gray-600">
                  This cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Exit Onboarding Confirmation Modal */}
    <AnimatePresence>
      {showExitConfirm && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Leave setup?</h3>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  You'll be signed out and can finish setup later. Your account won't be deleted, but onboarding won't be marked complete.
                </p>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExitOnboarding}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Leave setup
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Notification Modal */}
    <AnimatePresence>
      {notification && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-100' :
                notification.type === 'error' ? 'bg-red-100' :
                notification.type === 'warning' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {notification.type === 'success' && (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  notification.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-80 ${
                  notification.type === 'success' ? 'hover:bg-green-100' :
                  notification.type === 'error' ? 'hover:bg-red-100' :
                  notification.type === 'warning' ? 'hover:bg-yellow-100' :
                  'hover:bg-blue-100'
                }`}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

export default Onboarding