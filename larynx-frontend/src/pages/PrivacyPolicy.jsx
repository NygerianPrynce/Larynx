import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from "react-helmet"
import { ArrowLeft, Shield, Mail, Lock, Eye, Trash2, Download, X } from 'lucide-react'
import { motion } from 'framer-motion'

const PrivacyPolicy = () => {
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen bg-white" style={{ width: '100vw', maxWidth: '100%' }}>
      <Helmet>
        <link rel="canonical" href="https://www.larynxai.com/privacy" />
        <title>Larynx AI | Privacy Policy</title>
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-purple-100 hover:text-white transition-colors mb-6"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </motion.button>
          
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              variants={itemVariants}
            >
              Privacy Policy
            </motion.h1>
            <motion.p 
              className="text-purple-100 text-lg"
              variants={itemVariants}
            >
              Last updated: {new Date().toLocaleDateString()}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Introduction */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Larynx AI ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and protect your information when you use our email AI service.
            </p>
          </motion.section>

          {/* Information We Collect */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>
            </div>
            <p className="text-gray-700 mb-4">We collect the following types of information:</p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Account Information:</strong>
                  <span className="text-gray-700"> Email address, name, and profile information from your Google account</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Email Data:</strong>
                  <span className="text-gray-700"> Email content, metadata, and sending patterns to generate AI responses</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Usage Data:</strong>
                  <span className="text-gray-700"> How you interact with our service, features used, and performance metrics</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Technical Data:</strong>
                  <span className="text-gray-700"> IP address, browser type, device information, and session data</span>
                </div>
              </li>
            </ul>
          </motion.section>

          {/* How We Use Your Information */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Provide and improve our AI email drafting service</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Generate personalized email responses that match your writing style</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Sync with your offerings and business data for accurate communications</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Provide customer support and technical assistance</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Ensure security and prevent fraud</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Comply with legal obligations</span>
              </li>
            </ul>
          </motion.section>

          {/* Gmail Integration */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Gmail Integration</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Our service integrates with Gmail to read your emails and generate responses. We:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Only access emails necessary for our AI service functionality</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Do not store your emails permanently on our servers</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Use Gmail data solely to provide our email AI service</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Do not share your Gmail data with third parties for advertising</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Comply with Google's API Services User Data Policy</span>
              </li>
            </ul>
          </motion.section>

          {/* Data Security */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Data Security</h2>
            </div>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your data, including:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Encryption of data in transit and at rest</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Secure authentication and access controls</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Regular security audits and monitoring</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Compliance with industry security standards</span>
              </li>
            </ul>
          </motion.section>

          {/* Data Sharing */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6. Data Sharing</h2>
            </div>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information. We may share data only in these circumstances:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">With your explicit consent</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">To comply with legal requirements</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">To protect our rights and prevent fraud</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">With service providers who assist in our operations (under strict confidentiality agreements)</span>
              </li>
            </ul>
          </motion.section>

          {/* Your Rights */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">7. Your Rights</h2>
            </div>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Access your personal data</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Correct inaccurate data</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Request deletion of your data</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Withdraw consent for data processing</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Export your data</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Revoke Gmail access permissions</span>
              </li>
            </ul>
          </motion.section>

          {/* Data Retention */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">8. Data Retention</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We retain your data only as long as necessary to provide our services or as required by law. 
              You can request deletion of your account and associated data at any time.
            </p>
          </motion.section>

          {/* Contact Us */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">9. Contact Us</h2>
            </div>
            <p className="text-gray-700 mb-4">
              If you have questions about this privacy policy or your data, contact us at:
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 font-medium">
                Email: larynxai.official@gmail.com
              </p>
            </div>
          </motion.section>

          {/* Changes to Policy */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">10. Changes to This Policy</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy periodically. We will notify you of significant changes by email or through our service.
            </p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}

export default PrivacyPolicy