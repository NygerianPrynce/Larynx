import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, ArrowLeft, Save } from 'lucide-react'
import SigEditor from './SigEditor'
import { Helmet } from "react-helmet"

const OnboardingSigEditorTest = () => {
  const [signoff, setSignoff] = useState('')

  const handleSave = (content) => {
    console.log('Sign off saved:', content)
    alert('Sign off saved! Check console for content.')
  }

  const handleBack = () => {
    console.log('Back button clicked')
  }

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
    visible: { opacity: 1, y: 0 }
  }

  return (
    <>
      <Helmet>
        <title>Larynx AI | Onboarding Sign Off Editor Test</title>
        <link rel="canonical" href="https://www.larynxai.com/onboarding-sig-editor-test" />
      </Helmet>
      
      <div className="min-h-screen bg-white overflow-hidden relative" style={{ width: '100vw', maxWidth: '100%' }}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, 20, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 20, 0],
              y: [0, -40, 0]
            }}
            transition={{
              duration: 18,
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
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Sign Off Editor</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Onboarding Test
              </span>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Test the sign off editor as it appears in the onboarding flow.
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div 
            className="max-w-md mx-auto mb-12"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <div className="flex-1 h-1 bg-purple-200 rounded-full">
                <div className="h-1 bg-purple-500 rounded-full w-1/4"></div>
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <div className="flex-1 h-1 bg-purple-200 rounded-full">
                <div className="h-1 bg-purple-500 rounded-full w-1/4"></div>
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">3</span>
              </div>
              <div className="flex-1 h-1 bg-purple-200 rounded-full">
                <div className="h-1 bg-purple-500 rounded-full w-1/4"></div>
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">4</span>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-6xl"
          >
            {/* Sign Off Step - Mimicking Onboarding */}
            <motion.div 
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <SigEditor
                value={signoff}
                setValue={setSignoff}
                onBack={handleBack}
                onSave={handleSave}
              />
            </motion.div>
          </motion.div>

          {/* Test Info */}
          <motion.div
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Test Instructions</h3>
            <p className="text-blue-700 text-sm">
              This page replicates the sign off editor as it appears in the onboarding flow. 
              Test the toolbar width and functionality to ensure tools don't wrap to multiple lines.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default OnboardingSigEditorTest
