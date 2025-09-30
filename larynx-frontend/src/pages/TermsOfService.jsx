import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from "react-helmet"
import { ArrowLeft, FileText, Mail, Shield, CreditCard, AlertTriangle, Lock, Users, Settings, X } from 'lucide-react'
import { motion } from 'framer-motion'

const TermsOfService = () => {
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
        <link rel="canonical" href="https://www.larynxai.com/terms" />
        <title>Larynx AI | Terms of Service</title>
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
              Terms of Service
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
          {/* Agreement to Terms */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Agreement to Terms</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Larynx AI, you agree to be bound by these Terms of Service and our Privacy Policy. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </motion.section>

          {/* Description of Service */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Description of Service</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Larynx AI is an artificial intelligence-powered email assistant that integrates with Gmail to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Generate email responses that match your writing style</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Sync with your business offerings for accurate communications</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Automate email drafting while maintaining your authentic voice</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Provide analytics and insights on your email communications</span>
              </li>
            </ul>
          </motion.section>

          {/* Account Requirements */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Account Requirements</h2>
            </div>
            <p className="text-gray-700 mb-4">To use our service, you must:</p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Be at least 18 years old or have parental consent</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Have a valid Gmail account</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Provide accurate and complete information</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Maintain the security of your account credentials</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Comply with all applicable laws and regulations</span>
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
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Gmail Integration and Permissions</h2>
            </div>
            <p className="text-gray-700 mb-4">
              By connecting your Gmail account, you grant us permission to:
            </p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Read your email messages to understand your communication style</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Create draft responses in your Gmail account</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Access email metadata for analytics and service improvement</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Monitor new incoming emails for automated responses</span>
              </li>
            </ul>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800">
                <strong>Note:</strong> You can revoke these permissions at any time through your Google account settings or our service.
              </p>
            </div>
          </motion.section>

          {/* Acceptable Use */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Acceptable Use</h2>
            </div>
            <p className="text-gray-700 mb-4">You agree not to use our service to:</p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Send spam, unsolicited, or illegal communications</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Violate any laws, regulations, or third-party rights</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Impersonate others or provide false information</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Interfere with or disrupt our service or servers</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Attempt to gain unauthorized access to our systems</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Use our service for any malicious or harmful purposes</span>
              </li>
            </ul>
          </motion.section>

          {/* Intellectual Property */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6. Intellectual Property</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Larynx AI and its technology, including AI models and algorithms, are owned by us and protected by intellectual property laws. 
              You retain ownership of your email content and data, but grant us a license to process it for service provision.
            </p>
          </motion.section>

          {/* Subscription and Billing */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">7. Subscription and Billing</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Our service operates on a subscription basis. By subscribing, you agree to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Pay all applicable fees as described in your chosen plan</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Automatic renewal unless you cancel before the renewal date</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">No refunds for partial months or unused services</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Price changes with 30 days advance notice</span>
              </li>
            </ul>
          </motion.section>

          {/* Data Security and Privacy */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">8. Data Security and Privacy</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your data. However, no method of transmission 
              over the internet is 100% secure. You acknowledge that you provide your information at your own risk.
            </p>
          </motion.section>

          {/* Service Availability */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">9. Service Availability</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              While we strive for high availability, we do not guarantee uninterrupted service. We may experience downtime 
              for maintenance, updates, or technical issues. We are not liable for any damages resulting from service interruptions.
            </p>
          </motion.section>

          {/* Limitation of Liability */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">10. Limitation of Liability</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Larynx AI shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including loss of profits, data, or business opportunities.
            </p>
          </motion.section>

          {/* Termination */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">11. Termination</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Either party may terminate this agreement at any time. Upon termination:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Your access to the service will be suspended</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">We will delete your data according to our retention policy</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">All outstanding fees remain payable</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Provisions regarding liability and intellectual property survive termination</span>
              </li>
            </ul>
          </motion.section>

          {/* Changes to Terms */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">12. Changes to Terms</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We may modify these terms at any time. Significant changes will be communicated via email or through our service. 
              Continued use after changes constitutes acceptance of the new terms.
            </p>
          </motion.section>

          {/* Governing Law */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">13. Governing Law</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              These terms are governed by applicable laws. Any disputes will be resolved through appropriate legal channels.
            </p>
          </motion.section>

          {/* Contact Information */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">14. Contact Information</h2>
            </div>
            <p className="text-gray-700 mb-4">
              For questions about these terms, contact us at:
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 font-medium">
                Email: larynxai.official@gmail.com
              </p>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}

export default TermsOfService