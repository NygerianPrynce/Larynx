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
                  <strong className="text-gray-900">Sent Email Data (one-time, during onboarding):</strong>
                  <span className="text-gray-700"> Up to 100 of your most recent sent emails are analyzed to learn your writing style. We extract aggregate statistics (sentence length, vocabulary, tone) and a signature — we do not store the underlying email bodies after analysis.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Incoming Email Data (while monitoring is on):</strong>
                  <span className="text-gray-700"> The subject and body of incoming business emails are processed to generate a draft reply, stored for up to 7 days, then automatically deleted from our servers.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Business Profile Data:</strong>
                  <span className="text-gray-700"> Brand summary, inventory items and pricing, email signature, and any custom formatting or instructions you provide.</span>
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
              <h2 className="text-2xl font-bold text-gray-900">4. Gmail Integration & Google API Services</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Larynx AI uses the Gmail API under two OAuth scopes, each with a specific purpose:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">gmail.readonly</strong>
                  <span className="text-gray-700"> — Required to read incoming business emails so the AI can generate appropriate draft replies. We only process messages received after your account was created and that pass our business-email classifier.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">gmail.compose</strong>
                  <span className="text-gray-700"> — Required to save the generated reply as a draft in your Gmail Drafts folder. We never send emails on your behalf — you review and send each draft yourself.</span>
                </div>
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              Larynx AI's use of information received from Google APIs adheres to the{' '}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline hover:text-purple-900">
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. Specifically:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Gmail data is used solely to provide and improve the email drafting features of Larynx AI</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Gmail data is never used for advertising, sold, or transferred to third parties for marketing purposes</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Gmail data is never used to train, fine-tune, or improve any general-purpose machine learning model</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">No human at Larynx AI reads your Gmail messages, except as strictly necessary for security investigations, abuse prevention, or when you explicitly request support that requires it</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">
                  You can revoke our Gmail access at any time from your{' '}
                  <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline hover:text-purple-900">
                    Google Account permissions page
                  </a>
                </span>
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
              <h2 className="text-2xl font-bold text-gray-900">6. Data Sharing & Sub-Processors</h2>
            </div>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information. To provide the service, we rely on the following sub-processors who process your data on our behalf:
            </p>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">OpenAI</strong>
                  <span className="text-gray-700"> — To generate AI-powered draft replies, the subject and body of incoming emails, along with your tone profile, brand summary, and inventory list, are sent to OpenAI's API. OpenAI processes this data under their{' '}
                    <a href="https://openai.com/policies/api-data-usage-policies" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline hover:text-purple-900">
                      API Data Usage Policies
                    </a>
                    {' '}and does not use API inputs or outputs to train their models. We send only the data needed to generate a reply — no other personal information.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Supabase</strong>
                  <span className="text-gray-700"> — Hosts our application database where your account, OAuth tokens, drafts, tone profile, inventory, and brand summary are stored. Supabase is SOC 2 Type II certified and encrypts data at rest with AES-256.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Render</strong>
                  <span className="text-gray-700"> — Hosts our backend and frontend application servers. Render is SOC 2 Type II certified and enforces TLS 1.3 in transit.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Google</strong>
                  <span className="text-gray-700"> — Provides sign-in (OAuth 2.0) and Gmail API access. Your Google account data is governed by Google's own privacy policy.</span>
                </div>
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              Outside of these sub-processors, we share data only when:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">You give us explicit consent</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Required by law (subpoena, court order, or other legal process)</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Necessary to protect our rights, prevent fraud, or investigate security incidents</span>
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
            <p className="text-gray-700 mb-4">
              We retain different categories of data for different periods:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Email drafts and incoming email content:</strong>
                  <span className="text-gray-700"> Automatically deleted from our servers 7 days after creation. The draft itself remains in your Gmail Drafts folder, under your control.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Filtered email records (metadata only):</strong>
                  <span className="text-gray-700"> Sender, subject, and filter reason are retained for up to 30 days so the same message isn't re-processed.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Account information, tone profile, brand summary, inventory, signature:</strong>
                  <span className="text-gray-700"> Retained as long as your account is active; permanently deleted within 30 days of account deletion.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">OAuth tokens:</strong>
                  <span className="text-gray-700"> Retained while your account is active. On account deletion, we revoke the token with Google and delete it from our database immediately.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900">Server activity logs:</strong>
                  <span className="text-gray-700"> Retained for up to 30 days for security monitoring and debugging.</span>
                </div>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You can permanently delete your account and all associated data at any time from{' '}
              <strong>Settings → Delete Account</strong>. This action is irreversible: it revokes our Gmail access with Google, removes all your drafts, tone profile, inventory, brand data, and account record from our database.
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