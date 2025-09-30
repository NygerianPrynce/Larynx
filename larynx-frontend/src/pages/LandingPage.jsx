import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import logoImage from '../assets/logo.png'

// Professional SVG Icons
const Mail = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Sparkles = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const Shield = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Zap = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const ArrowRight = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ChevronDown = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const Menu = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const X = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const LandingPage = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState(null)
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)

  const emailResponse = "Hello Fadhil!\n\nFor 2 six-foot tables and 5 garden chairs, the total would be $50. Would you like me to reserve these for your event?\n\nBest Regards,\n*Blooms*"

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isDeleting) {
        // Deleting characters
        setCurrentCharIndex((prev) => prev - 1)
        if (currentCharIndex === 0) {
          setIsDeleting(false)
        }
      } else {
        // Typing characters
        setCurrentCharIndex((prev) => prev + 1)
        if (currentCharIndex === emailResponse.length) {
          setTimeout(() => setIsDeleting(true), 3000) // Pause before deleting
        }
      }
    }, isDeleting ? 50 : 80) // Faster typing for emails

    return () => clearTimeout(timeout)
  }, [currentCharIndex, isDeleting])

  const handleGetStarted = () => {
    setShowConsentModal(true)
  }

  const handleLogin = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      
      if (!apiUrl) {
        throw new Error('API configuration error')
      }
      
      // Check server availability before redirect
      const response = await fetch(`${apiUrl}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      
      if (!response.ok) {
        throw new Error('Authentication server unavailable')
      }
      
      // Redirect to backend auth
      window.location.href = `${apiUrl}/auth`
    } catch (error) {
      console.error('Login error:', error)
      // Fallback to login page if backend is unavailable
      navigate('/login')
    }
  }

  const handleWatchDemo = () => {
    // Scroll to demo section
    const demoSection = document.getElementById('demo')
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleProceedToAuth = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      
      if (!apiUrl) {
        throw new Error('API configuration error')
      }
      
      // Check if API is reachable before redirecting
      const response = await fetch(`${apiUrl}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (!response.ok) {
        throw new Error('Server is not responding')
      }
      
      // If server is reachable, proceed with auth
      window.location.href = `${apiUrl}/auth`
    } catch (error) {
      console.error('Auth error:', error)
      if (error.name === 'AbortError') {
        alert('Connection timeout - please check your internet connection')
      } else {
        alert('Unable to connect to authentication server. Please try again.')
      }
    }
  }

  const features = [
    {
      icon: Mail,
      title: "Smart Email Integration",
      description: "Seamlessly connect with Gmail for automated email processing and response generation",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Drafts",
      description: "Generate professional, personalized email responses in seconds with advanced AI",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Always Professional",
      description: "Maintain consistent professionalism and tone across all your business communications",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Save hours every week with instant email processing and response generation",
      color: "from-orange-500 to-red-500"
    }
  ]

  const useCases = [
    {
      industry: "Catering",
      scenario: "Wedding Inquiry Response",
      example: "Professional response to wedding catering inquiries with pricing, availability, and next steps"
    },
    {
      industry: "Event Rentals",
      scenario: "Equipment Booking Follow-up",
      example: "Detailed follow-up emails for event equipment rentals with delivery schedules and terms"
    },
    {
      industry: "Photography",
      scenario: "Portrait Session Confirmation",
      example: "Elegant confirmation emails for photo sessions with preparation tips and location details"
    },
    {
      industry: "Consulting",
      scenario: "Client Proposal Follow-up",
      example: "Professional follow-up emails for consulting proposals with next steps and timeline"
    },
    {
      industry: "Fitness Training",
      scenario: "Personal Training Inquiry",
      example: "Motivational response emails for fitness training inquiries with package options and scheduling"
    },
    {
      industry: "Home Services",
      scenario: "Service Quote Follow-up",
      example: "Detailed service quotes for home repairs with pricing, timeline, and next steps"
    },
    {
      industry: "Beauty Services",
      scenario: "Appointment Confirmation",
      example: "Elegant appointment confirmations with preparation instructions and service details"
    },
    {
      industry: "Real Estate",
      scenario: "Property Inquiry Response",
      example: "Professional property inquiry responses with viewing schedules and property details"
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Connect Your Gmail",
      description: "Simply sign in with your Google account. Larynx AI securely connects using Google's official authentication system.",
      icon: Mail
    },
    {
      step: "2", 
      title: "We Learn About Your Business & Style",
      description: "We analyze your website and previous emails to understand your brand voice, writing style, and communication patterns.",
      icon: Sparkles
    },
    {
      step: "3",
      title: "Configure Your Offerings",
      description: "Add your products, services, and pricing information so Larynx AI can provide accurate responses.",
      icon: Zap
    },
    {
      step: "4",
      title: "Smart Email Monitoring",
      description: "Our system monitors your inbox, filtering out spam and personal messages to focus on business inquiries.",
      icon: CheckCircle
    },
    {
      step: "5",
      title: "Intelligent Response Generation",
      description: "Larynx AI understands customer requests, checks your offerings, and crafts responses that sound exactly like you.",
      icon: Mail
    },
    {
      step: "6",
      title: "Review and Send",
      description: "Every response appears as a draft in Gmail. Review, edit, or send - you're always in control.",
      icon: Sparkles
    }
  ]

  const faqs = [
    {
      question: "How does Larynx AI work?",
      answer: "Larynx AI connects to your Gmail account and uses advanced AI to analyze incoming emails, understand context, and generate professional response drafts. You review and customize the drafts before sending."
    },
    {
      question: "Is my email data secure?",
      answer: "Yes! We use enterprise-grade security with 256-bit SSL encryption. Your data is never stored permanently and we follow strict privacy protocols."
    },
    {
      question: "Can I customize the AI responses?",
      answer: "Absolutely! You can set your communication style, add your business details, and the AI learns from your preferences to generate responses that sound like you."
    },
    {
      question: "What email types does it handle?",
      answer: "Larynx AI excels at business inquiries, appointment requests, service quotes, follow-ups, and general customer communications across various industries."
    },
    {
      question: "How much time does it save?",
      answer: "Users typically save 5-10 hours per week on email responses. The AI generates professional drafts in seconds, so you can focus on growing your business."
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <style>
        {`
          /* Hide scrollbars */
          body {
            overflow-x: hidden !important;
          }
          
          /* Landing page specific styles */
        `}
      </style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src={logoImage}
                alt="Larynx AI Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Larynx AI</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#use-cases" className="text-gray-600 hover:text-purple-600 transition-colors">Examples</a>
              <a href="#demo" className="text-gray-600 hover:text-purple-600 transition-colors">Demo</a>
              <a href="#benefits" className="text-gray-600 hover:text-purple-600 transition-colors">Benefits</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">How It Works</a>
              <button
                onClick={handleLogin}
                className="text-purple-600 bg-white border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300"
              >
                Login
              </button>
              <motion.button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-4">
                <a href="#use-cases" className="block text-gray-600 hover:text-purple-600 transition-colors">Examples</a>
                <a href="#demo" className="block text-gray-600 hover:text-purple-600 transition-colors">Demo</a>
                <a href="#benefits" className="block text-gray-600 hover:text-purple-600 transition-colors">Benefits</a>
                <a href="#how-it-works" className="block text-gray-600 hover:text-purple-600 transition-colors">How It Works</a>
                <button onClick={handleLogin} className="block text-purple-600 bg-white border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300 w-full text-center">Login</button>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Animated Background Elements - Matching Logo Colors */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-10 left-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 80, 0],
              y: [0, -50, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-32 right-16 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
              x: [0, -60, 0],
              y: [0, 60, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute bottom-16 left-1/3 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.5, 0.2],
              x: [0, 90, 0],
              y: [0, -70, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
          <motion.div 
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-200/25 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, -50, 0],
              y: [0, 50, 0]
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="absolute top-20 right-1/2 w-48 h-48 bg-blue-200/25 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
              x: [0, 40, 0],
              y: [0, -40, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Hero Logo */}
            <motion.div
              className="flex justify-center mb-8"
              variants={itemVariants}
            >
              <img 
                src={logoImage}
                alt="Larynx AI Logo"
                className="w-40 h-40 object-contain"
              />
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              variants={itemVariants}
            >
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 pb-2">
                Larynx AI
              </span>
              Your Inbox, Simplified.
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Your Business, Amplified.
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
              variants={itemVariants}
            >
              Larynx AI drafts personalized, brand-aligned emails and places them directly in your Gmail, ready to send — so you can focus on growing your business, not your inbox.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started Free</span>
                <ArrowRight />
              </motion.button>
              
              <motion.button
                onClick={handleWatchDemo}
                className="text-purple-600 bg-white border border-purple-600 px-6 py-3 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300 text-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo →
              </motion.button>
            </motion.div>


            {/* Gmail Conversation Preview */}
            <motion.div
              className="mt-8 mb-8"
              variants={itemVariants}
            >
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {/* Gmail Header */}
                <div className="bg-white px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-medium text-gray-900">Rent Inquiry</h3>
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">Inbox</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center hover:bg-yellow-500 transition-colors">
                            <div className="w-3 h-0.5 bg-gray-800"></div>
                          </div>
                          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                </div>
                
                {/* Email Conversation */}
                <div className="bg-white">
                  {/* First Email - Inquiry */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start space-x-3 mb-3">
                      <img 
                        src="/src/assets/fadhil.jpg" 
                        alt="Fadhil Lawal"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hidden flex-shrink-0">
                        <span className="text-white text-sm font-bold">FL</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">Fadhil Lawal</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">2:30 PM (2 minutes ago)</span>
                          </div>
                        </div>
                        <p className="text-gray-900 leading-relaxed text-left">
                          How much would it cost for me to rent 2 6 foot tables and 5 garden chairs?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Reply - Typing Animation */}
                  <div className="p-4 bg-gray-50">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 ml-2">
                              <img 
                                src="/src/assets/bloomslogo.jpg" 
                                alt="Blooms Event Rentals"
                                className="w-6 h-6 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center hidden">
                                <span className="text-white text-xs font-bold">B</span>
                              </div>
                              <span className="text-sm text-gray-900">Blooms event rentals</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                              <div className="w-2 h-0.5 bg-gray-800"></div>
                            </div>
                            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="mb-4">
                          <div className="text-gray-900 leading-relaxed text-sm text-left whitespace-pre-line">
                            <span className="inline">
                              {emailResponse.substring(0, currentCharIndex)}
                            </span>
                            <motion.span 
                              className="w-0.5 h-4 bg-blue-600 ml-0.5 inline-block align-middle"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>

            <motion.div
              className="text-sm text-gray-500"
              variants={itemVariants}
            >
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Setup in 5-10 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Demo Video Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              See Larynx AI
              <span className="block text-purple-600">In Action</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 mb-12"
              variants={itemVariants}
            >
              Watch how Larynx AI transforms your email communication in seconds
            </motion.p>
            
            <motion.div
              className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl aspect-video w-full max-w-4xl mx-auto"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <iframe
                src="https://www.youtube.com/embed/e_72kLmn_ik"
                title="Larynx AI Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Moving Gradient Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              Key Benefits
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              Why small business owners choose Larynx AI to handle their email communication
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Save Time</h3>
              <p className="text-gray-600 leading-relaxed">
                Reduce email response time from hours to minutes. Handle routine inquiries instantly while focusing on complex customer needs.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Maintain Your Voice</h3>
              <p className="text-gray-600 leading-relaxed">
                Unlike generic chatbots, Larynx AI writes in YOUR style. Your customers will never know the difference.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Never Miss Important Emails</h3>
              <p className="text-gray-600 leading-relaxed">
                Continuous monitoring ensures prompt responses to customer inquiries, improving customer satisfaction.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Business Context Awareness</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrates with your product catalog and pricing to provide accurate, up-to-date information automatically.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
        {/* Moving Gradient Spirals */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-40 right-40 w-80 h-80 bg-gradient-to-bl from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              x: [0, -60, 0],
              y: [0, 40, 0]
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-40 left-40 w-72 h-72 bg-gradient-to-tr from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, 70, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 13,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              How It Works
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              From setup to sending, Larynx AI makes email management effortless with our comprehensive 6-step process.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                variants={cardVariants}
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Moving Gradient Waves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-32 left-32 w-72 h-72 bg-gradient-to-bl from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 60, 0],
              y: [0, -50, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-32 right-32 w-64 h-64 bg-gradient-to-tr from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, 60, 0]
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              Perfect for Every
              <span className="block text-blue-600">Small Business</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              From photographers to caterers, event planners to consultants - Larynx AI adapts to your business needs.
            </motion.p>
          </motion.div>

          <motion.div
            className="landing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className="group"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{useCase.industry}</h3>
                    <p className="text-purple-600 font-medium text-sm mb-3">{useCase.scenario}</p>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">{useCase.example}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        {/* Moving Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              Everything You Need to
              <span className="block text-purple-600">Master Email Communication</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              Powerful AI-driven features designed specifically for small business owners who want to maintain professionalism while saving time.
            </motion.p>
          </motion.div>

          <motion.div
            className="landing-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>




      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              Frequently Asked
              <span className="block text-purple-600">Questions</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600"
              variants={itemVariants}
            >
              Everything you need to know about Larynx AI
            </motion.p>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 hover:shadow-md transition-all duration-300 shadow-sm ${
                  openFAQ === index ? 'rounded-b-none' : ''
                }`}
                variants={itemVariants}
              >
                <button
                  className={`w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-purple-50 transition-all duration-300 ${
                    openFAQ === index ? 'rounded-t-xl' : 'rounded-xl'
                  }`}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-600 transition-all duration-200 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-gray-100 rounded-b-xl"
                    >
                      <div className="px-6 pt-4 pb-6 text-gray-700 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              variants={itemVariants}
            >
              Ready to Transform Your
              <span className="block">Email Communication?</span>
            </motion.h2>
            <motion.p
              className="text-xl text-purple-100 mb-8"
              variants={itemVariants}
            >
              Join small business owners who save hours every week with Larynx AI.
            </motion.p>
            <motion.div
              variants={itemVariants}
            >
              <motion.button
                onClick={handleGetStarted}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started Free</span>
                <ArrowRight />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src={logoImage}
                alt="Larynx AI Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold">Larynx AI</span>
            </div>
            <div className="flex space-x-8 text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="mailto:larynxai.official@gmail.com" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Larynx AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modernized Consent Modal */}
      <AnimatePresence>
        {showConsentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConsentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowConsentModal(false)}
                className="absolute top-4 right-4 px-2 py-1 border border-purple-300 text-purple-700 bg-white rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
              >
                <X size={20} />
              </button>

              {/* Modal Content */}
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost There!</h2>
                  <p className="text-gray-600">
                    To create emails that sound authentically like you, Larynx AI needs to securely connect with your Gmail account.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Google Sign-in</h3>
                      <p className="text-gray-600 text-sm">
                        You'll be redirected to Google's secure sign-in page to authenticate with your Gmail account.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Permission Request</h3>
                      <p className="text-gray-600 text-sm">
                        Google will ask which permissions you'd like to grant to Larynx AI for your account.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Select Access</h3>
                      <p className="text-gray-600 text-sm">
                        You'll see options to allow Larynx AI to read, compose, and send emails on your behalf.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">Your Privacy Matters</h4>
                      <p className="text-purple-700 text-sm mb-3">
                        Larynx AI only accesses emails needed for business communication. We never read personal messages, 
                        and you can revoke access anytime in your Google account settings.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <a 
                          href="/privacy" 
                          className="text-purple-600 hover:text-purple-800 underline text-sm font-medium transition-colors"
                        >
                          Privacy Policy
                        </a>
                        <a 
                          href="/terms" 
                          className="text-purple-600 hover:text-purple-800 underline text-sm font-medium transition-colors"
                        >
                          Terms & Conditions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowConsentModal(false)}
                    className="flex-1 px-6 py-3 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={() => {
                      setShowConsentModal(false)
                      handleProceedToAuth()
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Continue with Google</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LandingPage
