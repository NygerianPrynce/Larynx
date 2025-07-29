// File: src/pages/TermsOfService.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from "react-helmet";

const TermsOfService = () => {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <Helmet>
      <link rel="canonical" href="https://www.larynxai.com/login" />
      <title>Larynx AI | Privacy</title>
    </Helmet>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
      <div style={styles.content}>
        <button onClick={() => navigate('/')} style={styles.backLink}>← Back to Home</button>
        
        <h1 style={styles.title}>Terms of Service</h1>
        <p style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Agreement to Terms</h2>
          <p style={styles.text}>
            By accessing or using Larynx AI, you agree to be bound by these Terms of Service and our Privacy Policy. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Description of Service</h2>
          <p style={styles.text}>
            Larynx AI is an artificial intelligence-powered email assistant that integrates with Gmail to:
          </p>
          <ul style={styles.list}>
            <li>Generate email responses that match your writing style</li>
            <li>Sync with your business inventory for accurate communications</li>
            <li>Automate email drafting while maintaining your authentic voice</li>
            <li>Provide analytics and insights on your email communications</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Account Requirements</h2>
          <p style={styles.text}>To use our service, you must:</p>
          <ul style={styles.list}>
            <li>Be at least 18 years old or have parental consent</li>
            <li>Have a valid Gmail account</li>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Gmail Integration and Permissions</h2>
          <p style={styles.text}>
            By connecting your Gmail account, you grant us permission to:
          </p>
          <ul style={styles.list}>
            <li>Read your email messages to understand your communication style</li>
            <li>Create draft responses in your Gmail account</li>
            <li>Access email metadata for analytics and service improvement</li>
            <li>Monitor new incoming emails for automated responses</li>
          </ul>
          <p style={styles.text}>
            You can revoke these permissions at any time through your Google account settings or our service.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Acceptable Use</h2>
          <p style={styles.text}>You agree not to use our service to:</p>
          <ul style={styles.list}>
            <li>Send spam, unsolicited, or illegal communications</li>
            <li>Violate any laws, regulations, or third-party rights</li>
            <li>Impersonate others or provide false information</li>
            <li>Interfere with or disrupt our service or servers</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use our service for any malicious or harmful purposes</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Intellectual Property</h2>
          <p style={styles.text}>
            Larynx AI and its technology, including AI models and algorithms, are owned by us and protected by intellectual property laws. 
            You retain ownership of your email content and data, but grant us a license to process it for service provision.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Subscription and Billing</h2>
          <p style={styles.text}>
            Our service operates on a subscription basis. By subscribing, you agree to:
          </p>
          <ul style={styles.list}>
            <li>Pay all applicable fees as described in your chosen plan</li>
            <li>Automatic renewal unless you cancel before the renewal date</li>
            <li>No refunds for partial months or unused services</li>
            <li>Price changes with 30 days advance notice</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Data Security and Privacy</h2>
          <p style={styles.text}>
            We implement industry-standard security measures to protect your data. However, no method of transmission 
            over the internet is 100% secure. You acknowledge that you provide your information at your own risk.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Service Availability</h2>
          <p style={styles.text}>
            While we strive for high availability, we do not guarantee uninterrupted service. We may experience downtime 
            for maintenance, updates, or technical issues. We are not liable for any damages resulting from service interruptions.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>10. Limitation of Liability</h2>
          <p style={styles.text}>
            To the maximum extent permitted by law, Larynx AI shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages, including loss of profits, data, or business opportunities.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>11. Termination</h2>
          <p style={styles.text}>
            Either party may terminate this agreement at any time. Upon termination:
          </p>
          <ul style={styles.list}>
            <li>Your access to the service will be suspended</li>
            <li>We will delete your data according to our retention policy</li>
            <li>All outstanding fees remain payable</li>
            <li>Provisions regarding liability and intellectual property survive termination</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>12. Changes to Terms</h2>
          <p style={styles.text}>
            We may modify these terms at any time. Significant changes will be communicated via email or through our service. 
            Continued use after changes constitutes acceptance of the new terms.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>13. Governing Law</h2>
          <p style={styles.text}>
            These terms are governed by applicable laws. Any disputes will be resolved through appropriate legal channels.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>14. Contact Information</h2>
          <p style={styles.text}>
            For questions about these terms, contact us at:
          </p>
          <p style={styles.text}>
            Email: fadhillawal06@gmail.com
          </p>
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
    fontFamily: 'Arial, sans-serif'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    lineHeight: '1.6'
  },
  backLink: {
    color: '#8b5cf6',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '20px',
    display: 'inline-block'
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '10px',
    background: 'linear-gradient(45deg, #a855f7, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  lastUpdated: {
    color: '#9ca3af',
    marginBottom: '40px'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#8b5cf6'
  },
  text: {
    fontSize: '16px',
    marginBottom: '16px',
    color: '#d1d5db'
  },
  list: {
    paddingLeft: '20px',
    color: '#d1d5db'
  }
}

export default TermsOfService