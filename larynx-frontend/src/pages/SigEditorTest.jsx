import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Save, RotateCcw } from 'lucide-react'
import SigEditor from './SigEditor'
import { Helmet } from "react-helmet"

const SigEditorTest = () => {
  const [signoff, setSignoff] = useState('')
  const [savedSignoff, setSavedSignoff] = useState('')

  const handleSave = (content) => {
    setSavedSignoff(content)
    console.log('Sign off saved:', content)
  }

  const handleReset = () => {
    setSignoff('')
    setSavedSignoff('')
  }

  const handleBack = () => {
    console.log('Back button clicked')
  }

  return (
    <>
      <Helmet>
        <title>Larynx AI | Sign Off Editor Test</title>
        <link rel="canonical" href="https://www.larynxai.com/sig-editor-test" />
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
        </div>

        {/* Header */}
        <div className="relative z-10 pt-16 pb-8">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Sign Off Editor</h1>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Test Mode
                </span>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Test the sign off editor with all its modern features and functionality.
              </p>
            </motion.div>

            {/* Test Controls */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Controls</h3>
                  <p className="text-gray-600 text-sm">Manage the test sign off and see saved content.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                  >
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>
                  {savedSignoff && (
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-xl flex items-center space-x-2">
                      <Save size={16} />
                      <span>Saved!</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Sign Off Editor */}
            <SigEditor
              value={signoff}
              setValue={setSignoff}
              onSave={handleSave}
              onBack={handleBack}
            />

            {/* Saved Sign Off Preview */}
            {savedSignoff && (
              <motion.div
                className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Save className="w-5 h-5 text-green-600" />
                  <span>Saved Sign Off Preview</span>
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div 
                    className="text-gray-800"
                    dangerouslySetInnerHTML={{ __html: savedSignoff }}
                  />
                </div>
              </motion.div>
            )}

            {/* Raw HTML Output */}
            {savedSignoff && (
              <motion.div
                className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw HTML Output</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                  <code>{savedSignoff}</code>
                </pre>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SigEditorTest