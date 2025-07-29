import React, { useState, useEffect } from 'react'
import InventoryPage from './InventoryPage'
import SigEditor from './SigEditor'


// Custom SVG Icons
const Globe = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Edit = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Mail = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Package = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const Shield = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ArrowRight = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

const CheckCircle = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Trash = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Play = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v1.586a1 1 0 00.293.707l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h1m-1 1v1m0 0V8a2 2 0 012-2h1m-1 1v1" />
  </svg>
)

const AlertTriangle = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
  </svg>
)

const Sparkles = () => (
  <svg style={{ display: 'inline', width: '48px', height: '48px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.057 3.057M5 3l3.057-3.057M5 3h6m4 0l3.057 3.057M19 3l-3.057-3.057M19 3h-6m-4 8l3.057 3.057M9 11l3.057-3.057M9 11h6m4 0l3.057 3.057M19 11l-3.057-3.057M19 11h-6m-4 8l3.057 3.057M9 19l3.057-3.057M9 19h6m4 0l3.057 3.057M19 19l-3.057-3.057M19 19h-6" />
  </svg>
)

const Onboarding = () => {
  const [hasWebsite, setHasWebsite] = useState(true)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [manualStep, setManualStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('intro')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [brandSummary, setBrandSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [particles, setParticles] = useState([])
  const [emailCrawlMessages, setEmailCrawlMessages] = useState([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [brandInfo, setBrandInfo] = useState({
    brand_name: '',
    business_description: '',
    target_audience: '',
    industry: '',
    business_mission: '',
    key_differentiators: ''
  })

  const api = import.meta.env.VITE_API_URL

  const manualSteps = [
    { key: 'brand_name', label: "What's your brand name?", type: 'input', min: 1, max: 200 },
    { key: 'business_description', label: 'What does your business do?', type: 'textarea', min: 10, max: 1000 },
    { key: 'target_audience', label: 'Who are your ideal customers?', type: 'textarea', min: 5, max: 500 },
    { key: 'industry', label: 'What industry are you in?', type: 'input', min: 2, max: 100 },
    { key: 'business_mission', label: "What's your company's mission? (Optional)", type: 'textarea', optional: true, max: 500 },
    { key: 'key_differentiators', label: 'What makes you different? (Optional)', type: 'textarea', optional: true, max: 1000 }
  ]

  const crawlMessages = [
    'Connecting to your email...',
    'Analyzing your writing style...',
    'Learning your tone and voice...',
    'Extracting your email signature...',
    'Identifying common phrases...',
    'Understanding your communication patterns...',
    'Almost done...'
  ]

  useEffect(() => {
    // Generate floating particles
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 60; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 10
        })
      }
      setParticles(newParticles)
    }
    generateParticles()
  }, [])

  // Cycle through crawl messages
  useEffect(() => {
    if (emailCrawlMessages.length > 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % emailCrawlMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [emailCrawlMessages.length])

  const transitionToStep = (newStep) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setStep(newStep)
      setIsTransitioning(false)
    }, 300)
  }

  const setLoadingState = (loading, message = '') => {
    setIsLoading(loading)
    setLoadingMessage(message)
    if (!loading) {
      setEmailCrawlMessages([])
      setShowSuccessMessage(false)
    }
  }

  const fetchSignature = async () => {
    try {
      setLoadingState(true, 'Fetching your signature...')
      const res = await fetch(`${api}/signature`, {
        credentials: 'include'
      })
      const data = await res.json()
      setSignature(data.signature || '')
      transitionToStep('signature')
    } catch (err) {
      alert('Failed to fetch signature.')
    } finally {
      setLoadingState(false)
    }
  }

  const updateSignature = async () => {
    try {
      setLoadingState(true, 'Saving your signature...')
      const res = await fetch(`${api}/signature`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ signature })
      })

      if (res.ok) {
        transitionToStep('inventory')
      } else {
        alert('Failed to update signature.')
      }
    } catch (err) {
      alert('Error while updating signature.')
    } finally {
      setLoadingState(false)
    }
  }

  const fetchBrandSummary = async () => {
    try {
      setLoadingState(true, 'Generating your brand summary...')
      const res = await fetch(`${api}/get-brand-summary`, {
        credentials: 'include'
      })
      const data = await res.json()
      setBrandSummary(data.summary || 'No summary found.')
      transitionToStep('summary')
    } catch (err) {
      alert('Failed to fetch brand summary.')
    } finally {
      setLoadingState(false)
    }
  }

  const handleConfirmBrandSummary = async () => {
    try {
      setLoadingState(true, 'Saving your brand summary...')
      const res = await fetch(`${api}/update-brand-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ summary: brandSummary })
      })

      if (res.ok) {
        transitionToStep('tone')
      } else {
        alert("Failed to update brand summary.")
      }
    } catch (err) {
      alert("Error while updating brand summary.")
    } finally {
      setLoadingState(false)
    }
  }

  const normalizeUrl = (url) => {
    try {
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url
      }
      const parsed = new URL(url)
      const hostname = parsed.hostname

      if (
        !hostname.includes('.') ||
        hostname.endsWith('.') ||
        !/[a-zA-Z]/.test(hostname)
      ) {
        return null
      }

      return parsed.href
    } catch (_) {
      return null
    }
  }

  const handleWebsiteSubmit = async () => {
    const normalized = normalizeUrl(websiteUrl)
    if (!normalized) {
      setErrors({ ...errors, websiteUrl: "Please enter a valid website address." })
      return
    }

    setErrors({ ...errors, websiteUrl: null })
    setLoadingState(true, 'Analyzing your website...')
    try {
      const res = await fetch(`${api}/website-scrape?url=${encodeURIComponent(normalized)}`, {
        credentials: 'include',
      })
      await fetchBrandSummary()
    } catch (err) {
      alert('Failed to scrape website.')
    } finally {
      setLoadingState(false)
    }
  }

  const validateAndNextStep = async () => {
    const stepConfig = manualSteps[manualStep]
    const value = brandInfo[stepConfig.key].trim()
    const isOptional = stepConfig.optional
    const newErrors = { ...errors }

    if (!isOptional && (value.length < stepConfig.min || value.length > stepConfig.max)) {
      newErrors[stepConfig.key] = `${stepConfig.label} must be between ${stepConfig.min} and ${stepConfig.max} characters.`
      setErrors(newErrors)
      return
    }

    if (isOptional && value.length > stepConfig.max) {
      newErrors[stepConfig.key] = `${stepConfig.label} must be at most ${stepConfig.max} characters.`
      setErrors(newErrors)
      return
    }

    setErrors({})
    const nextStep = manualStep + 1

    if (nextStep < manualSteps.length) {
      setManualStep(nextStep)
    } else {
      await handleManualSubmit()
    }
  }

  const handleManualSubmit = async () => {
    setLoadingState(true, 'Processing your information...')
    try {
      const res = await fetch(`${api}/upload-brand-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandInfo),
        credentials: 'include',
      })
      await fetchBrandSummary()
    } catch (err) {
      alert('Failed to upload brand info.')
    } finally {
      setLoadingState(false)
    }
  }

  const handleEmailCrawl = async () => {
    try {
      setEmailCrawlMessages(crawlMessages)
      setCurrentMessageIndex(0)
      setLoadingState(true)
      
      const res = await fetch(`${api}/crawl-emails`, {
        credentials: 'include'
      })
      
      // Show success message
      setShowSuccessMessage(true)
      setEmailCrawlMessages([])
      setLoadingMessage('Successfully analyzed your emails!')
      
      // Wait 2 seconds to show success, then proceed
      setTimeout(async () => {
        await fetchSignature()
      }, 2000)
    } catch (err) {
      alert('Error crawling emails.')
      setLoadingState(false)
    }
  }

  const handleGenericTone = async () => {
    try {
      setLoadingState(true, 'Setting up default tone...')
      const res = await fetch(`${api}/set-generic-tone`, {
        method: 'POST',
        credentials: 'include'
      })
      await fetchSignature()
    } catch (err) {
      alert('Error setting generic tone.')
    } finally {
      setLoadingState(false)
    }
  }

  useEffect(() => {
    if (step === 'finalizing') {
      const timer = setTimeout(() => {
        window.location.href = '/home'
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [step])

  const getStepIcon = () => {
    switch (step) {
      case 'intro': return <Globe />
      case 'summary': return <Edit />
      case 'tone': return <Mail />
      case 'signature': return <Edit />
      case 'inventory': return <Package />
      case 'monitoringConsent': return <Shield />
      default: return <Globe />
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'intro': return hasWebsite ? 'Tell us about your business' : 'Let\'s get to know you'
      case 'summary': return 'Review your brand summary'
      case 'tone': return 'Personalize your email tone'
      case 'signature': return 'Create your email signature'
      case 'inventory': return 'Add your products/services'
      case 'monitoringConsent': return 'Enable email monitoring'
      case 'finalizing': return 'Setting up your account'
      default: return 'Welcome to Larynx AI'
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
          
          body {
            margin: 0;
            padding: 0;
          }
          
          @keyframes float {
            0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(30px) rotate(360deg); opacity: 0; }
          }
          
          @keyframes floatHorizontal {
            0% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            100% { transform: translateX(-5px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.05); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
          }
          
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
          
          .step-content {
            animation: fadeIn 0.5s ease-out;
          }
          
          .step-content.transitioning {
            animation: fadeOut 0.3s ease-in;
          }
          
          .primary-button:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
          }
          
          .secondary-button:hover {
            background: rgba(107, 114, 128, 0.8);
            transform: scale(1.02);
          }
          
          .danger-button:hover {
            background: rgba(220, 38, 38, 0.9);
            transform: scale(1.02);
          }
          
          .success-button:hover {
            background: rgba(16, 185, 129, 0.9);
            transform: scale(1.02);
          }
          
          .toggle-link:hover {
            color: #a855f7;
          }
          
          .crawl-message {
            animation: messageSlide 2s ease-in-out;
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
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: particle.opacity,
              animation: `float ${particle.duration}s linear infinite ${particle.delay}s, floatHorizontal 4s ease-in-out infinite ${particle.delay * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            
            {/* Show cycling messages for email crawling */}
            {emailCrawlMessages.length > 0 && (
              <div style={styles.crawlMessageContainer}>
                <p style={styles.crawlMessage} className="crawl-message" key={currentMessageIndex}>
                  {emailCrawlMessages[currentMessageIndex]}
                </p>
              </div>
            )}
            
            {/* Show success message */}
            {showSuccessMessage && (
              <div style={styles.successMessageContainer}>
                <CheckCircle />
                <p style={styles.successMessage}>Successfully analyzed your emails!</p>
              </div>
            )}
            
            {/* Regular loading message */}
            {!emailCrawlMessages.length && !showSuccessMessage && loadingMessage && (
              <p style={styles.loadingText}>{loadingMessage}</p>
            )}
            
            {/* Default processing message */}
            {!emailCrawlMessages.length && !showSuccessMessage && !loadingMessage && (
              <p style={styles.loadingText}>Processing...</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.stepIcon}>
            {getStepIcon()}
          </div>
          <h1 style={styles.title}>{getStepTitle()}</h1>
          <p style={styles.subtitle}>Let's set up your AI email assistant</p>
        </div>

        {/* Step Content */}
        <div style={styles.stepContainer} className={`step-content ${isTransitioning ? 'transitioning' : ''}`}>
          {step === 'intro' && hasWebsite && (
            <div style={styles.card}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Website URL</label>
                <input
                  type="text"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value)
                    setErrors({ ...errors, websiteUrl: null })
                  }}
                  style={styles.input}
                />
                {errors.websiteUrl && <p style={styles.error}>{errors.websiteUrl}</p>}
              </div>
              <button onClick={handleWebsiteSubmit} style={styles.primaryButton} className="primary-button">
                <span>Analyze Website</span>
                <ArrowRight />
              </button>
              <p style={styles.toggleLink} className="toggle-link" onClick={() => setHasWebsite(false)}>
                Don't have a website? Fill out manually instead
              </p>
            </div>
          )}

          {step === 'intro' && !hasWebsite && (
            <div style={styles.card}>
              {manualStep < manualSteps.length && (
                <>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${((manualStep + 1) / manualSteps.length) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div style={styles.stepInfo}>
                    Step {manualStep + 1} of {manualSteps.length}
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{manualSteps[manualStep].label}</label>
                    {manualSteps[manualStep].type === 'textarea' ? (
                      <textarea
                        value={brandInfo[manualSteps[manualStep].key]}
                        onChange={(e) => {
                          setBrandInfo({ ...brandInfo, [manualSteps[manualStep].key]: e.target.value })
                          setErrors({ ...errors, [manualSteps[manualStep].key]: null })
                        }}
                        style={styles.textarea}
                        placeholder="Tell us more..."
                      />
                    ) : (
                      <input
                        type="text"
                        value={brandInfo[manualSteps[manualStep].key]}
                        onChange={(e) => {
                          setBrandInfo({ ...brandInfo, [manualSteps[manualStep].key]: e.target.value })
                          setErrors({ ...errors, [manualSteps[manualStep].key]: null })
                        }}
                        style={styles.input}
                        placeholder="Enter here..."
                      />
                    )}
                    {errors[manualSteps[manualStep].key] && (
                      <p style={styles.error}>{errors[manualSteps[manualStep].key]}</p>
                    )}
                  </div>
                  <button onClick={validateAndNextStep} style={styles.primaryButton} className="primary-button">
                    <span>{manualStep === manualSteps.length - 1 ? 'Complete' : 'Next'}</span>
                    <ArrowRight />
                  </button>
                  <p style={styles.toggleLink} className="toggle-link" onClick={() => setHasWebsite(true)}>
                    Actually, I do have a website
                  </p>
                </>
              )}
            </div>
          )}

          {step === 'summary' && (
            <div style={styles.card}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Brand Summary</label>
                <p style={styles.description}>
                  We've analyzed your information and created this summary. Feel free to edit it to better reflect your brand.
                </p>
                <textarea
                  value={brandSummary}
                  onChange={(e) => setBrandSummary(e.target.value)}
                  style={styles.largeTextarea}
                />
              </div>
              <button onClick={handleConfirmBrandSummary} style={styles.primaryButton} className="primary-button">
                <span>Save & Continue</span>
                <ArrowRight />
              </button>
            </div>
          )}

          {step === 'tone' && (
            <div style={styles.card}>
              <div style={styles.toneInfo}>
                <h3 style={styles.cardTitle}>Email Tone Analysis</h3>
                <p style={styles.description}>
                  We can analyze your recent emails to understand your writing style, tone, and common phrases.
                  This helps us generate emails that sound authentically like you.
                </p>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  onClick={handleEmailCrawl}
                  style={styles.primaryButton}
                  className="primary-button"
                >
                  <span>Analyze My Emails</span>
                  <ArrowRight />
                </button>
                <button
                  onClick={handleGenericTone}
                  style={styles.secondaryButton}
                  className="secondary-button"
                >
                  Skip - Use Default Tone
                </button>
              </div>
            </div>
          )}

          {step === 'signature' && (
            <div style={styles.card}>
              <SigEditor
                value={signature}
                setValue={setSignature}
                onBack={() => transitionToStep('tone')}
                onSave={updateSignature}
              />
            </div>
          )}

          {step === 'inventory' && (
            <div style={styles.inventoryWrapper}>
              <InventoryPage
                embedded={true}
                onBack={() => transitionToStep('signature')}
                onNext={() => transitionToStep('monitoringConsent')}
              />
            </div>
          )}

          {step === 'monitoringConsent' && (
            <div style={styles.card}>
              <div style={styles.consentInfo}>
                <h3 style={styles.cardTitle}>Enable Email Monitoring</h3>
                <p style={styles.description}>
                  To provide AI email assistance, we need permission to monitor your inbox for new emails 
                  and draft replies. This is essential for our service to work.
                </p>
                <div style={styles.warningBox}>
                  <div style={styles.warningHeader}>
                    <AlertTriangle />
                    <span style={styles.warningTitle}>Important Notice</span>
                  </div>
                  <p style={styles.warningText}>
                    Without email monitoring, we cannot detect new messages or help with responses. 
                    Declining will result in account termination.
                  </p>
                </div>
              </div>
              <div style={styles.finalButtons}>
                <button
                  style={styles.dangerButton}
                  className="danger-button"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      '⚠️ WARNING: This action is IRREVERSIBLE.\n\nAre you absolutely sure you want to permanently delete your account and all associated data?\n\nThis cannot be undone.'
                    )
                    if (!confirmed) return

                    setLoadingState(true, 'Deleting your account...')
                    const res = await fetch(`${api}/user/delete`, {
                      method: 'DELETE',
                      credentials: 'include'
                    })
                    if (res.ok) {
                      alert('Your account has been deleted. Goodbye 🫡')
                      window.location.href = '/'
                    } else {
                      alert('Something went wrong while deleting your account.')
                    }
                    setLoadingState(false)
                  }}
                >
                  Delete Account
                </button>
                <button
                  onClick={async () => {
                    setLoadingState(true, 'Enabling email monitoring...')
                    const res = await fetch(`${api}/start-monitoring`, {
                      method: 'POST',
                      credentials: 'include'
                    })

                    if (res.ok) {
                      setLoadingMessage('Finalizing your setup...')
                      await fetch(`${api}/finish-onboarding`, {
                        method: 'POST',
                        credentials: 'include'
                      })
                      transitionToStep('finalizing')
                    } else {
                      alert('Something went wrong enabling monitoring.')
                    }
                    setLoadingState(false)
                  }}
                  style={styles.successButton}
                  className="success-button"
                >
                  Start Monitoring
                </button>
              </div>
            </div>
          )}

          {step === 'finalizing' && (
            <div style={styles.finalizingCard}>
              <div style={styles.finalizingContent}>
                <div style={styles.successIcon}>🎉</div>
                <h2 style={styles.finalizingTitle}>Welcome to Larynx AI!</h2>
                <p style={styles.finalizingText}>
                  Your account is being set up. You'll be redirected to your dashboard shortly.
                </p>
                <div style={styles.spinner}></div>
              </div>
            </div>
          )}
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
    top: '20%',
    left: '20%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 6s ease-in-out infinite'
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: '20%',
    right: '20%',
    width: '250px',
    height: '250px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 6s ease-in-out infinite 3s'
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
  loadingOverlay: {
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
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  loadingText: {
    color: 'white',
    fontSize: '18px',
    marginTop: '20px'
  },
  crawlMessageContainer: {
    marginTop: '20px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  crawlMessage: {
    color: '#8b5cf6',
    fontSize: '16px',
    fontWeight: '500'
  },
  successMessageContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
    padding: '16px 24px',
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px'
  },
  successMessage: {
    color: '#10b981',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0
  },
  main: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
    padding: '48px 0'
  },
  stepIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    borderRadius: '50%',
    marginBottom: '24px',
    color: 'white'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '12px',
    background: 'linear-gradient(45deg, #ffffff, #a855f7, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '18px',
    color: '#d1d5db'
  },
  stepContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    padding: '40px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid #374151',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
  },
  inventoryWrapper: {
    width: '100%',
    maxWidth: '1000px'
  },
  finalizingCard: {
    width: '100%',
    maxWidth: '500px',
    padding: '60px 40px',
    background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.2), rgba(139, 92, 246, 0.2))',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    textAlign: 'center'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(55, 65, 81, 0.8)',
    borderRadius: '4px',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    transition: 'width 0.3s ease',
    borderRadius: '4px'
  },
  stepInfo: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '24px',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '32px'
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: '12px'
  },
  description: {
    fontSize: '14px',
    color: '#d1d5db',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '16px',
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '16px',
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    resize: 'vertical',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box'
  },
  largeTextarea: {
    width: '100%',
    minHeight: '180px',
    padding: '16px',
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    resize: 'vertical',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px 24px',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '16px'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px 24px',
    background: 'rgba(107, 114, 128, 0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  dangerButton: {
    padding: '16px 24px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  successButton: {
    padding: '16px 32px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  toggleLink: {
    color: '#3b82f6',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
    textAlign: 'center',
    transition: 'color 0.3s ease'
  },
  error: {
    color: '#f87171',
    fontSize: '14px',
    marginTop: '8px'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '16px'
  },
  toneInfo: {
    marginBottom: '32px'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  consentInfo: {
    marginBottom: '32px'
  },
  warningBox: {
    padding: '16px',
    background: 'rgba(245, 158, 11, 0.2)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '12px',
    marginTop: '20px'
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  warningTitle: {
    color: '#fbbf24',
    fontSize: '16px',
    fontWeight: '600'
  },
  warningText: {
    color: '#fbbf24',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  finalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap'
  },
  finalizingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '24px'
  },
  finalizingTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '16px',
    background: 'linear-gradient(45deg, #10b981, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  finalizingText: {
    fontSize: '16px',
    color: '#d1d5db',
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(139, 92, 246, 0.3)',
    borderTopColor: '#8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
}

export default Onboarding