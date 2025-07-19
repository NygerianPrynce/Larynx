import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


// Custom SVG Icons
const ChevronRight = () => (
  <svg style={{ display: 'inline', width: '24px', height: '24px', marginLeft: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const ArrowRight = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px', marginLeft: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

const Star = ({ style }) => (
  <svg style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)



const LarynxAILaunch = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [particles, setParticles] = useState([])

  const navigate = useNavigate()
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth`
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
      icon: "✉️",
      title: "AI-Powered Email Drafting",
      description: "Automatically generates emails that sound authentically like you"
    },
    {
      icon: "⚡",
      title: "Inventory Intelligence",
      description: "Smart inventory awareness ensures accurate, up-to-date communications"
    },
    {
      icon: "🔒",
      title: "Gmail Integration",
      description: "Seamlessly integrates with your existing Gmail workflow"
    }
  ]

  const testimonials = [
    { name: "Sarah Chen", role: "Business Owner", text: "Cut my email response time by 80%" },
    { name: "Marcus Rodriguez", role: "Sales Manager", text: "Finally, emails that actually sound like me" },
    { name: "Emma Thompson", role: "E-commerce Director", text: "Inventory-aware emails are a game changer" }
  ]

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
      gap: '8px'
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 'bold'
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
      fontSize: '32px',
      marginBottom: '16px',
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
      margin: '0 auto 16px'
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
    }
  }

  return (
    <div style={styles.container}>
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
          
          .nav-button:hover {
            background-color: #7c3aed !important;
            transform: scale(1.05);
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
          
          @media (max-width: 768px) {
            .hero-title { font-size: 48px !important; }
            .hero-subtitle { font-size: 18px !important; }
            .section-title { font-size: 32px !important; }
            .cta-title { font-size: 32px !important; }
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
          <div style={styles.logoIcon}>L</div>
          <span style={styles.logoText}>Larynx AI</span>
        </div>
        <button style={styles.navButton} className="nav-button" onClick={handleLogin}>
          Get Started
        </button>
      </nav>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle} className="hero-title">
            Email Intelligence<br />Reimagined
          </h1>
          <p style={styles.heroSubtitle} className="hero-subtitle">
            Larynx AI automatically drafts emails that sound authentically like you, 
            while staying perfectly in sync with your inventory and business needs.
          </p>
          <div style={styles.heroButtons}>
            <button style={styles.primaryButton} className="primary-button" onClick={handleLogin}>
              Get Started
              <ArrowRight />
            </button>
            <button style={styles.secondaryButton} className="secondary-button">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Showcase */}
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={index}
              style={{
                ...styles.featureCard,
                ...(currentFeature === index ? styles.featureCardActive : {})
              }}
            >
              <span style={{
                ...styles.featureIcon,
                color: currentFeature === index ? '#8b5cf6' : '#9ca3af'
              }}>
                {feature.icon}
              </span>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div>
              <div style={styles.statNumber}>80%</div>
              <div style={styles.statLabel}>Faster Email Drafting</div>
            </div>
            <div>
              <div style={{...styles.statNumber, color: '#3b82f6'}}>100%</div>
              <div style={styles.statLabel}>Your Voice Preserved</div>
            </div>
            <div>
              <div style={styles.statNumber}>24/7</div>
              <div style={styles.statLabel}>Inventory Sync</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div>
          <h2 style={styles.sectionTitle} className="section-title">How It Works</h2>
          <div style={styles.howItWorksGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.stepTitle}>Connect Gmail</h3>
              <p style={styles.stepDescription}>Securely link your Gmail account in seconds</p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.stepTitle}>AI Learns You</h3>
              <p style={styles.stepDescription}>Our AI studies your writing style and inventory</p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.stepTitle}>Perfect Emails</h3>
              <p style={styles.stepDescription}>Get authentic, inventory-aware emails automatically</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 style={styles.sectionTitle} className="section-title">Loved by Professionals</h2>
          <div style={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} style={styles.testimonialCard}>
                <div style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: '20px', height: '20px' }} />
                  ))}
                </div>
                <p style={styles.testimonialText}>"{testimonial.text}"</p>
                <div style={styles.testimonialName}>{testimonial.name}</div>
                <div style={styles.testimonialRole}>{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={styles.ctaSection}>
          <h2 style={styles.ctaTitle} className="cta-title">Ready to Transform Your Email Game?</h2>
          <p style={styles.ctaDescription}>
            Join thousands of professionals who've revolutionized their email workflow with Larynx AI.
          </p>
          <button style={styles.ctaButton} className="cta-button" onClick={handleLogin}>
            Get Started Now
            <ChevronRight />
          </button>
          <p style={styles.ctaNote}>Free 14-day trial • No credit card required</p>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.logo}>
            <div style={{...styles.logoIcon, width: '24px', height: '24px'}}>L</div>
            <span style={{fontWeight: 'bold'}}>Larynx AI</span>
          </div>
          <div style={styles.footerLinks}>
            <a href="#" style={styles.footerLink} className="footer-link">Privacy</a>
            <a href="#" style={styles.footerLink} className="footer-link">Terms</a>
            <a href="#" style={styles.footerLink} className="footer-link">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LarynxAILaunch