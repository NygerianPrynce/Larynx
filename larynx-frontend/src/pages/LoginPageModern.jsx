import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Epic SVG Icons with enhanced styling
const Mail = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Shield = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Sparkles = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

const Eye = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const LoginPageModern = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      navigate('/onboarding')
    }, 2000)
  }


  const features = [
    {
      icon: Mail,
      title: "Smart Email Integration",
      description: "Seamlessly connect with Gmail for automated email processing",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Responses",
      description: "Generate professional email drafts with advanced AI technology",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with end-to-end encryption",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process emails and generate responses in seconds",
      color: "from-orange-500 to-red-500"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <style>
        {`
          @media (min-width: 1024px) and (max-width: 1400px) {
            .login-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <motion.div
        className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="login-grid max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" style={{ maxWidth: 'min(95vw, 1400px)', margin: '0 auto' }}>
          
          {/* Left Side - Branding & Features */}
          <motion.div
            className="space-y-8"
            variants={itemVariants}
          >
            {/* Logo & Title */}
            <div className="space-y-6">
              <motion.div
                className="flex items-center space-x-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <span className="text-2xl font-bold text-white">L</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Larynx AI
                  </h1>
                  <p className="text-purple-200 text-lg">Your AI Email Assistant</p>
                </div>
              </motion.div>

              <motion.div
                className="space-y-4"
                variants={itemVariants}
              >
                <h2 className="text-5xl font-bold text-white leading-tight">
                  Transform Your
                  <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Email Experience
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  Let AI handle your email responses while you focus on what matters most. 
                  Professional, personalized, and lightning-fast.
                </p>
              </motion.div>
            </div>

            {/* Feature Cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Login Card */}
          <motion.div
            className="flex justify-center lg:justify-end"
            variants={itemVariants}
          >
            <motion.div
              className="w-full max-w-md"
              variants={cardVariants}
            >
              {/* Main Login Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                
                {/* Card Header */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                    <Mail className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
                  <p className="text-gray-300">Sign in to continue to Larynx AI</p>
                </motion.div>

                {/* Login Form */}
                <motion.div
                  className="space-y-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {/* Google Sign In Button */}
                  <motion.button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full group relative bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <span>Connecting...</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="normal"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-3"
                          >
                            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-yellow-500 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">G</span>
                            </div>
                            <span>Continue with Google</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-transparent text-gray-400">Secure & Private</span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <motion.div
                    className="flex items-center justify-center space-x-2 text-gray-400 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <Shield className="w-4 h-4" />
                    <span>256-bit SSL encryption</span>
                  </motion.div>
                </motion.div>

                {/* Footer */}
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <p className="text-gray-400 text-sm">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                      Privacy Policy
                    </a>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

    </div>
  )
}

export default LoginPageModern
