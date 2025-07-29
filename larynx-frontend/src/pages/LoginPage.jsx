import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Package, Layers, ChevronRight, ArrowRight, Star, Key, MessageSquare, Zap, Menu, X } from 'lucide-react'
import logoImage from '../assets/logo.png' // Import your custom logo
import { Helmet } from "react-helmet";

// Custom SVG Icons for arrows and star
const ArrowRightCustom = () => (
  <ArrowRight size={20} style={{ marginLeft: '8px' }} />
)

const ChevronRightCustom = () => (
  <ChevronRight size={24} style={{ marginLeft: '8px' }} />
)

const StarCustom = ({ style }) => (
  <Star size={20} fill="currentColor" style={style} />
)

const LarynxAILaunch = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [particles, setParticles] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigate = useNavigate()
  const [showConsentModal, setShowConsentModal] = useState(false)
  
  const handleGetStarted = () => {
    setShowConsentModal(true)
  }
  
  const handleProceedToAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth`
  }
  
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth`
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false) // Close mobile menu after clicking
  }

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 3)
    }, 3000)

    // Generate floating particles
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 250; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          opacity: Math.random() * 0.5 + 0.1,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 10
        })
      }
      setParticles(newParticles)
    }
    generateParticles()

    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Mail,
      title: "Business Intelligence Integration",
      description: "Our system learns your business through smart onboarding questions and website analysis, creating a dynamic business profile that understands your products, services, and brand voice to ensure every email reflects your authentic business identity."
    },
    {
      icon: Package,
      title: "Automated Email Monitoring", 
      description: "We're developing intelligent Gmail monitoring that continuously watches for incoming emails, detects legitimate business inquiries using bot detection, and automatically generates contextual draft replies that match your communication style and business needs."
    },
    {
      icon: Layers,
      title: "Smart Inventory Integration",
      description: "Our AI analyzes incoming email content to identify relevant products or services mentioned, then automatically incorporates accurate inventory information, pricing, and availability into your draft responses."
    }
  ]

  const testimonials = []

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
      top: '25%',
      left: '25%',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 4s ease-in-out infinite'
    },
    backgroundOrb2: {
      position: 'absolute',
      bottom: '25%',
      right: '25%',
      width: '320px',
      height: '320px',
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 4s ease-in-out infinite 2s'
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
    particle: {
      position: 'absolute',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 100%)',
      borderRadius: '50%',
      pointerEvents: 'none'
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 32px',
      position: 'relative',
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px'
    },
    navLink: {
      color: '#d1d5db',
      textDecoration: 'none',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'color 0.3s ease',
      cursor: 'pointer'
    },
    hamburger: {
      display: 'none',
      background: 'none',
      border: 'none',
      color: '#d1d5db',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    },
    mobileMenu: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '32px',
      zIndex: 1000,
      opacity: isMenuOpen ? 1 : 0,
      visibility: isMenuOpen ? 'visible' : 'hidden',
      transition: 'all 0.3s ease'
    },
    mobileMenuLink: {
      color: '#d1d5db',
      textDecoration: 'none',
      fontSize: '24px',
      fontWeight: '500',
      transition: 'color 0.3s ease',
      cursor: 'pointer'
    },
    mobileMenuButton: {
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '25px',
      border: 'none',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    closeButton: {
      position: 'absolute',
      top: '32px',
      right: '32px',
      background: 'none',
      border: 'none',
      color: '#d1d5db',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    },
    logoImage: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      objectFit: 'contain',
      filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4))'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #a855f7, #8b5cf6)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    navButton: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      padding: '8px 24px',
      borderRadius: '25px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '16px'
    },
    main: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '80px 32px 128px',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease'
    },
    hero: {
      textAlign: 'center',
      marginBottom: '64px'
    },
    heroLogoContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '48px'
    },
    heroLogo: {
      width: '180px',
      height: '180px',
      borderRadius: '32px',
      objectFit: 'contain',
      filter: 'drop-shadow(0 20px 40px rgba(139, 92, 246, 0.7))',
      animation: 'logoFloat 6s ease-in-out infinite'
    },
    heroTitle: {
      fontSize: '72px',
      fontWeight: 'bold',
      marginBottom: '24px',
      background: 'linear-gradient(45deg, #a855f7, #8b5cf6, #3b82f6)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: '1.1'
    },
    heroSubtitle: {
      fontSize: '24px',
      color: '#d1d5db',
      marginBottom: '32px',
      maxWidth: '800px',
      margin: '0 auto 32px',
      lineHeight: '1.6'
    },
    heroButtons: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    primaryButton: {
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '25px',
      border: 'none',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
    },
    secondaryButton: {
      border: '1px solid #6b7280',
      backgroundColor: 'transparent',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '25px',
      fontSize: '18px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      marginBottom: '80px'
    },
    featureCard: {
      background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
      backdropFilter: 'blur(10px)',
      padding: '32px',
      borderRadius: '16px',
      border: '1px solid #374151',
      transition: 'all 0.5s ease',
      cursor: 'pointer'
    },
    featureCardActive: {
      borderColor: '#8b5cf6',
      boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)',
      transform: 'scale(1.05)'
    },
    featureIcon: {
      width: '48px',
      height: '48px',
      marginBottom: '24px',
      display: 'block'
    },
    featureTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '12px'
    },
    featureDescription: {
      color: '#d1d5db',
      lineHeight: '1.6'
    },
    statsSection: {
      background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      padding: '48px',
      marginBottom: '80px',
      border: '1px solid rgba(139, 92, 246, 0.2)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '32px',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#a855f7',
      marginBottom: '8px'
    },
    statLabel: {
      color: '#d1d5db',
      fontSize: '16px'
    },
    sectionTitle: {
      fontSize: '48px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '48px'
    },
    howItWorksGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '32px',
      marginBottom: '80px'
    },
    stepCard: {
      textAlign: 'center',
      position: 'relative'
    },
    stepNumber: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 auto 24px'
    },
    stepTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '12px'
    },
    stepDescription: {
      color: '#d1d5db',
      lineHeight: '1.6'
    },
    testimonialsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      marginBottom: '80px'
    },
    testimonialCard: {
      background: 'rgba(55, 65, 81, 0.5)',
      backdropFilter: 'blur(10px)',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #374151'
    },
    stars: {
      display: 'flex',
      justifyContent: 'center',
      color: '#8b5cf6',
      marginBottom: '16px'
    },
    testimonialText: {
      color: '#d1d5db',
      fontStyle: 'italic',
      marginBottom: '16px'
    },
    testimonialName: {
      fontWeight: '600',
      marginBottom: '4px'
    },
    testimonialRole: {
      fontSize: '14px',
      color: '#9ca3af'
    },
    ctaSection: {
      textAlign: 'center',
      background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      padding: '64px',
      border: '1px solid rgba(139, 92, 246, 0.2)'
    },
    ctaTitle: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '24px'
    },
    ctaDescription: {
      fontSize: '20px',
      color: '#d1d5db',
      marginBottom: '32px',
      maxWidth: '600px',
      margin: '0 auto 32px'
    },
    ctaButton: {
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      color: 'white',
      padding: '16px 48px',
      borderRadius: '25px',
      border: 'none',
      fontSize: '20px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
    },
    ctaNote: {
      fontSize: '14px',
      color: '#9ca3af',
      marginTop: '16px'
    },
    footer: {
      borderTop: '1px solid #374151',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)'
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    footerLinks: {
      display: 'flex',
      gap: '32px',
      color: '#9ca3af'
    },
    footerLink: {
      color: '#9ca3af',
      textDecoration: 'none',
      transition: 'color 0.3s ease'
    },
    footerLogo: {
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      objectFit: 'contain',
      filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))'
    },
    // Consent Modal Styles - Fixed for zoom compatibility
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2vw', // Use viewport units for better scaling
      overflowY: 'auto' // Allow scrolling if content is too tall
    },
    modalContent: {
      background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(55, 65, 81, 0.95))',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      padding: '3vw', // Use viewport units for responsive padding
      maxWidth: '90vw', // Ensure it never exceeds viewport width
      width: '600px', // Preferred width
      maxHeight: '90vh', // Prevent modal from exceeding viewport height
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
      overflowY: 'auto', // Allow scrolling within modal if needed
      margin: 'auto' // Center the modal
    },
    modalTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '24px',
      background: 'linear-gradient(45deg, #a855f7, #8b5cf6)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    modalText: {
      fontSize: '18px',
      lineHeight: '1.6',
      color: '#d1d5db',
      marginBottom: '32px'
    },
    stepsList: {
      textAlign: 'left',
      marginBottom: '32px',
      background: 'rgba(55, 65, 81, 0.3)',
      borderRadius: '16px',
      padding: '24px'
    },
    stepItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '20px',
      fontSize: '16px',
      lineHeight: '1.5'
    },
    modalStepNumber: {
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      color: 'white',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      marginRight: '16px',
      flexShrink: 0,
      marginTop: '2px'
    },
    stepText: {
      color: '#d1d5db'
    },
    importantNote: {
      background: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '32px',
      fontSize: '16px',
      color: '#e5e7eb'
    },
    modalButtons: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    modalButtonSecondary: {
      border: '1px solid #6b7280',
      backgroundColor: 'transparent',
      color: '#d1d5db',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    modalButtonPrimary: {
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      color: 'white',
      padding: '12px 32px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
    },
    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      fontSize: '24px',
      cursor: 'pointer',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    },
    modalLink: {
      color: '#8b5cf6',
      textDecoration: 'underline',
      fontWeight: '500',
      transition: 'color 0.3s ease'
    },
    earlyAccessSection: {
      background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      padding: '48px 32px',
      border: '1px solid rgba(139, 92, 246, 0.15)',
      marginBottom: '80px'
    },
    earlyAccessGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '32px',
      alignItems: 'start'
    },
    earlyAccessCard: {
      textAlign: 'center',
      padding: '0 16px'
    }
  }

  return (
    <div style={styles.container}>
      <Helmet>
            <link rel="canonical" href="https://www.larynxai.com/" />
            <title>Larynx AI</title>
      </Helmet>
      <style>
        {`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes float {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes floatHorizontal {
          0% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(-10px); }
        }
        
        @keyframes logoFloat {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(1deg); }
          50% { transform: scale(1.1) rotate(0deg); }
          75% { transform: scale(1.05) rotate(-1deg); }
        }
        
        .nav-button:hover {
          background-color: #7c3aed !important;
          transform: scale(1.05);
        }
        
        .nav-link:hover {
          color: #8b5cf6 !important;
        }
        
        .hamburger:hover {
          background-color: rgba(139, 92, 246, 0.2) !important;
          color: #8b5cf6 !important;
        }
        
        .mobile-nav-link:hover {
          color: #8b5cf6 !important;
        }
        
        .mobile-menu-button:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
        }
        
        .close-button:hover {
          background-color: rgba(139, 92, 246, 0.2) !important;
          color: #8b5cf6 !important;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .hamburger {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
        
        .primary-button:hover {
          transform: scale(1.05);
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.4);
        }
        
        .secondary-button:hover {
          border-color: #8b5cf6;
          background-color: rgba(139, 92, 246, 0.2);
        }
        
        .cta-button:hover {
          transform: scale(1.05);
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.4);
        }
        
        .footer-link:hover {
          color: #8b5cf6 !important;
        }
        
        .modal-button-secondary:hover {
          border-color: #8b5cf6;
          background-color: rgba(139, 92, 246, 0.1);
        }
        
        .modal-button-primary:hover {
          transform: scale(1.02);
          box-shadow: 0 12px 24px rgba(139, 92, 246, 0.4);
        }
        
        .close-button:hover {
          background-color: rgba(156, 163, 175, 0.1);
          color: #f3f4f6;
        }
        
        .modal-link:hover {
          color: #a855f7;
        }
        
        /* Responsive design for different screen sizes and zoom levels */
        @media (max-width: 768px) {
          .hero-title { font-size: 48px !important; }
          .hero-subtitle { font-size: 18px !important; }
          .section-title { font-size: 32px !important; }
          .cta-title { font-size: 32px !important; }
        }
        
        /* Modal responsive adjustments for zoom levels */
        @media (max-height: 800px) {
          .modal-content {
            padding: 24px !important;
            max-height: 95vh !important;
          }
          .modal-title {
            font-size: 24px !important;
          }
          .modal-text {
            font-size: 16px !important;
          }
        }
        
        @media (max-height: 600px) {
          .modal-content {
            padding: 20px !important;
            max-height: 98vh !important;
          }
          .steps-list {
            margin: 16px 0 !important;
            padding: 16px !important;
          }
          .important-note {
            padding: 12px !important;
            margin: 16px 0 !important;
          }
        }
        `}
      </style>

      {/* Animated background elements */}
      <div style={styles.backgroundOrb1}></div>
      <div style={styles.backgroundOrb2}></div>
      
      {/* Floating Particles */}
      <div style={styles.particleContainer}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              ...styles.particle,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${particle.duration}s linear infinite ${particle.delay}s, floatHorizontal 4s ease-in-out infinite ${particle.delay * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <img 
            src={logoImage}
            alt="Larynx AI Logo"
            style={styles.logoImage}
          />
          <span style={styles.logoText}>Larynx AI</span>
        </div>
        
        {/* Desktop Navigation */}
        <div style={styles.navLinks} className="desktop-nav">
          <a onClick={() => scrollToSection('features')} style={styles.navLink} className="nav-link">Features</a>
          <a onClick={() => scrollToSection('how-it-works')} style={styles.navLink} className="nav-link">How It Works</a>
          <a onClick={() => scrollToSection('early-access')} style={styles.navLink} className="nav-link">Early Access</a>
          <button style={styles.navButton} className="nav-button" onClick={handleLogin}>
            Log In
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button 
          style={styles.hamburger} 
          className="hamburger"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div style={styles.mobileMenu} className="mobile-menu">
        <button 
          style={styles.closeButton}
          onClick={() => setIsMenuOpen(false)}
        >
          <X size={24} />
        </button>
        
        <a onClick={() => scrollToSection('features')} style={styles.mobileMenuLink} className="mobile-nav-link">
          Features
        </a>
        <a onClick={() => scrollToSection('how-it-works')} style={styles.mobileMenuLink} className="mobile-nav-link">
          How It Works
        </a>
        <a onClick={() => scrollToSection('early-access')} style={styles.mobileMenuLink} className="mobile-nav-link">
          Early Access
        </a>
        <button style={styles.mobileMenuButton} className="mobile-menu-button" onClick={handleLogin}>
          Log In
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Hero Section */}
        <div style={styles.hero}>
          {/* Large Hero Logo */}
          <div style={styles.heroLogoContainer}>
            <img 
              src={logoImage}
              alt="Larynx AI"
              style={styles.heroLogo}
            />
          </div>
          
          <h1 style={styles.heroTitle} className="hero-title">
            Email Intelligence<br />Reimagined
          </h1>
          <p style={styles.heroSubtitle} className="hero-subtitle">
            Larynx AI automatically drafts emails that sound authentically like you, 
            while staying perfectly in sync with your inventory and business needs. Join our beta program to experience the future of email automation.
          </p>
          <div style={styles.heroButtons}>
            <button style={styles.primaryButton} className="primary-button" onClick={handleGetStarted}>
               Get Started
              <ArrowRightCustom />
            </button>
            <button style={styles.secondaryButton} className="secondary-button">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Showcase */}
        <div id="features" style={styles.featuresGrid}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div 
                key={index}
                style={{
                  ...styles.featureCard,
                  ...(currentFeature === index ? styles.featureCardActive : {})
                }}
              >
                <IconComponent 
                  style={{
                    ...styles.featureIcon,
                    stroke: currentFeature === index ? '#8b5cf6' : '#9ca3af'
                  }}
                />
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div>
              <div style={styles.statNumber}>Auto</div>
              <div style={styles.statLabel}>Email Monitoring</div>
            </div>
            <div>
              <div style={{...styles.statNumber, color: '#3b82f6'}}>Smart</div>
              <div style={styles.statLabel}>Inventory Sync</div>
            </div>
            <div>
              <div style={styles.statNumber}>Instant</div>
              <div style={styles.statLabel}>Draft Creation</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works">
          <h2 style={styles.sectionTitle} className="section-title">How It Works</h2>
          <div style={styles.howItWorksGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.stepTitle}>Complete Setup</h3>
              <p style={styles.stepDescription}>Add your business info, writing style, signature, and inventory through our guided onboarding process</p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.stepTitle}>AI Takes Over</h3>
              <p style={styles.stepDescription}>Our system monitors your Gmail and automatically generates draft replies using your business context and inventory data</p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.stepTitle}>Review & Send</h3>
              <p style={styles.stepDescription}>Check the AI-generated drafts in your Gmail and send when ready - you maintain full control over every message</p>
            </div>
          </div>
        </div>

        {/* Early Access Benefits Section */}
        <div id="early-access">
          <h2 style={styles.sectionTitle} className="section-title">Why Join Early Access?</h2>
          <div style={styles.earlyAccessSection}>
            <div style={styles.earlyAccessGrid}>
              <div style={styles.earlyAccessCard}>
                <Key size={48} style={{color: '#8b5cf6', marginBottom: '16px'}} />
                <h3 style={styles.stepTitle}>First Access</h3>
                <p style={styles.stepDescription}>Be among the first to experience next-generation email AI and get priority access to new features as they're released</p>
              </div>
              <div style={styles.earlyAccessCard}>
                <MessageSquare size={48} style={{color: '#3b82f6', marginBottom: '16px'}} />
                <h3 style={styles.stepTitle}>Direct Input</h3>
                <p style={styles.stepDescription}>Your insights and suggestions directly influence the product roadmap and help us build exactly what businesses need</p>
              </div>
              <div style={styles.earlyAccessCard}>
                <Zap size={48} style={{color: '#8b5cf6', marginBottom: '16px'}} />
                <h3 style={styles.stepTitle}>Priority Support</h3>
                <p style={styles.stepDescription}>Get dedicated support and regular updates as we refine the platform and add new capabilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={styles.ctaSection}>
          <h2 style={styles.ctaTitle} className="cta-title">Ready to Help Build the Future of Email?</h2>
          <p style={styles.ctaDescription}>
            Join our exclusive beta program and be part of developing AI that truly understands your communication style. 
            Your feedback will directly shape how this technology evolves.
          </p>
          <button style={styles.ctaButton} className="cta-button" onClick={handleGetStarted}>
            Join Beta Program
            <ChevronRightCustom />
          </button>
          <p style={styles.ctaNote}>Free beta access • Limited spots available • Your feedback matters</p>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.logo}>
            <img 
              src={logoImage}
              alt="Larynx AI Logo"
              style={styles.footerLogo}
            />
            <span style={{fontWeight: 'bold'}}>Larynx AI</span>
          </div>
          <div style={styles.footerLinks}>
            <Link to="/privacy" style={styles.footerLink} className="footer-link">Privacy</Link>
            <Link to="/terms" style={styles.footerLink} className="footer-link">Terms</Link>    
          </div>
        </div>
      </footer>

      {/* Consent Modal */}
      {showConsentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConsentModal(false)}>
          <div style={styles.modalContent} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeButton} 
              className="close-button"
              onClick={() => setShowConsentModal(false)}
            >
              ✕
            </button>
            
            <h2 style={styles.modalTitle} className="modal-title">Almost There! 🚀</h2>
            
            <p style={styles.modalText} className="modal-text">
              To create emails that sound authentically like you, Larynx AI needs to securely connect with your Gmail account. 
              Here's exactly what will happen next:
            </p>

            <div style={styles.stepsList} className="steps-list">
              <div style={styles.stepItem}>
                <div style={styles.modalStepNumber}>1</div>
                <div style={styles.stepText}>
                  <strong>Google Sign-in:</strong> You'll be redirected to Google's secure sign-in page to authenticate with your Gmail account.
                </div>
              </div>
              
              <div style={styles.stepItem}>
                <div style={styles.modalStepNumber}>2</div>
                <div style={styles.stepText}>
                  <strong>Permission Request:</strong> Google will ask which permissions you'd like to grant to Larynx AI for your account.
                </div>
              </div>
              
              <div style={styles.stepItem}>
                <div style={styles.modalStepNumber}>3</div>
                <div style={styles.stepText}>
                  <strong>Select Access:</strong> You'll see options to allow Larynx AI to read, compose, and send emails on your behalf.
                </div>
              </div>
            </div>

            <div style={styles.importantNote} className="important-note">
              <strong>💡 For the best experience:</strong> We recommend granting all Gmail permissions when prompted. 
              This allows Larynx AI to learn your writing style, understand your email patterns, and draft responses that truly sound like you. 
              You can always modify these permissions later in your Google Account settings.
            </div>

            <p style={styles.modalText} className="modal-text">
              Your privacy and security are our top priorities. All data is encrypted and used solely to improve your email experience. 
              You maintain full control and can revoke access at any time. Read our{' '}
              <a href="/privacy" style={styles.modalLink} className="modal-link" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" style={styles.modalLink} className="modal-link" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              for more details.
            </p>

            <div style={styles.modalButtons}>
              <button 
                style={styles.modalButtonSecondary} 
                className="modal-button-secondary"
                onClick={() => setShowConsentModal(false)}
              >
                Maybe Later
              </button>
              <button 
                style={styles.modalButtonPrimary} 
                className="modal-button-primary"
                onClick={handleProceedToAuth}
              >
                Continue to Google Sign-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LarynxAILaunch