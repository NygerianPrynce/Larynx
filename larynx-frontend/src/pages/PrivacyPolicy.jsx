// File: src/pages/PrivacyPolicy.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

const PrivacyPolicy = () => {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/')} style={styles.backLink}>← Back to Home</button>
        
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Introduction</h2>
          <p style={styles.text}>
            Larynx AI ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and protect your information when you use our email AI service.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Information We Collect</h2>
          <p style={styles.text}>We collect the following types of information:</p>
          <ul style={styles.list}>
            <li><strong>Account Information:</strong> Email address, name, and profile information from your Google account</li>
            <li><strong>Email Data:</strong> Email content, metadata, and sending patterns to generate AI responses</li>
            <li><strong>Usage Data:</strong> How you interact with our service, features used, and performance metrics</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and session data</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. How We Use Your Information</h2>
          <p style={styles.text}>We use your information to:</p>
          <ul style={styles.list}>
            <li>Provide and improve our AI email drafting service</li>
            <li>Generate personalized email responses that match your writing style</li>
            <li>Sync with your inventory and business data for accurate communications</li>
            <li>Provide customer support and technical assistance</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Gmail Integration</h2>
          <p style={styles.text}>
            Our service integrates with Gmail to read your emails and generate responses. We:
          </p>
          <ul style={styles.list}>
            <li>Only access emails necessary for our AI service functionality</li>
            <li>Do not store your emails permanently on our servers</li>
            <li>Use Gmail data solely to provide our email AI service</li>
            <li>Do not share your Gmail data with third parties for advertising</li>
            <li>Comply with Google's API Services User Data Policy</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Data Security</h2>
          <p style={styles.text}>
            We implement appropriate technical and organizational measures to protect your data, including:
          </p>
          <ul style={styles.list}>
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security audits and monitoring</li>
            <li>Compliance with industry security standards</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Data Sharing</h2>
          <p style={styles.text}>
            We do not sell, trade, or rent your personal information. We may share data only in these circumstances:
          </p>
          <ul style={styles.list}>
            <li>With your explicit consent</li>
            <li>To comply with legal requirements</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Your Rights</h2>
          <p style={styles.text}>You have the right to:</p>
          <ul style={styles.list}>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for data processing</li>
            <li>Export your data</li>
            <li>Revoke Gmail access permissions</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Data Retention</h2>
          <p style={styles.text}>
            We retain your data only as long as necessary to provide our services or as required by law. 
            You can request deletion of your account and associated data at any time.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Contact Us</h2>
          <p style={styles.text}>
            If you have questions about this privacy policy or your data, contact us at:
          </p>
          <p style={styles.text}>
            Email: fadhillawal06@gmail.com
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>10. Changes to This Policy</h2>
          <p style={styles.text}>
            We may update this privacy policy periodically. We will notify you of significant changes by email or through our service.
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
    fontFamily: 'Arial, sans-serif',
    padding: '40px 20px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
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

export default PrivacyPolicy