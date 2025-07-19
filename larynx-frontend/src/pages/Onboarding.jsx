import React, { useState } from 'react'
import SignatureEditor from './signatureEditor'; // adjust path if needed
import InventoryPage from './InventoryPage'
import { useEffect } from 'react'


const Onboarding = () => {
  const [hasWebsite, setHasWebsite] = useState(true)

  const [websiteUrl, setWebsiteUrl] = useState('')
  const [manualStep, setManualStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('intro')
  const [brandSummary, setBrandSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [signature, setSignature] = useState('')
  const [brandInfo, setBrandInfo] = useState({
    brand_name: '',
    business_description: '',
    target_audience: '',
    industry: '',
    business_mission: '',
    key_differentiators: ''
  })

  const api = import.meta.env.VITE_API_URL

  const manualSteps = [
    { key: 'brand_name', label: 'What’s your brand name?', type: 'input', min: 1, max: 200 },
    { key: 'business_description', label: 'What does your business do?', type: 'textarea', min: 10, max: 1000 },
    { key: 'target_audience', label: 'Who are your ideal customers?', type: 'textarea', min: 5, max: 500 },
    { key: 'industry', label: 'What industry are you in?', type: 'input', min: 2, max: 100 },
    { key: 'business_mission', label: 'What’s your company’s mission? (Optional)', type: 'textarea', optional: true, max: 500 },
    { key: 'key_differentiators', label: 'What makes you different? (Optional)', type: 'textarea', optional: true, max: 1000 }
  ]
  const fetchSignature = async () => {
  try {
    setIsLoading(true)
    const res = await fetch(`${api}/signature`, {
      credentials: 'include'
    })
    const data = await res.json()
    setSignature(data.signature || '')
    setStep('signature') // Go to the signature editing step
  } catch (err) {
    alert('Failed to fetch signature.')
  } finally {
    setIsLoading(false)
  }
}
const updateSignature = async () => {
  try {
    setIsLoading(true)
    const res = await fetch(`${api}/signature`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ signature })
    })

    if (res.ok) {
      setStep('inventory') // 👈 move to inventory after saving signature
    } else {
      alert('Failed to update signature.')
    }
  } catch (err) {
    alert('Error while updating signature.')
  } finally {
    setIsLoading(false)
  }
}

  const fetchBrandSummary = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${api}/get-brand-summary`, {
        credentials: 'include'
      })
      const data = await res.json()
      setBrandSummary(data.summary || 'No summary found.')
      setStep('summary')
    } catch (err) {
      alert('Failed to fetch brand summary.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmBrandSummary = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${api}/update-brand-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ summary: brandSummary })
      })

      const data = await res.json()

      if (res.ok) {
        setStep('tone')
      } else {
        console.error("❌ Failed to update:", data)
        alert("Failed to update brand summary.")
      }
    } catch (err) {
      console.error("❌ Error updating summary:", err)
      alert("Error while updating brand summary.")
    } finally {
      setIsLoading(false)
    }
  }

  const normalizeUrl = (url) => {
    try {
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url
      }
      const parsed = new URL(url)
      const hostname = parsed.hostname

      if (
        !hostname.includes('.') ||
        hostname.endsWith('.') ||
        !/[a-zA-Z]/.test(hostname)
      ) {
        return null
      }

      return parsed.href
    } catch (_) {
      return null
    }
  }

  const handleWebsiteSubmit = async () => {
    const normalized = normalizeUrl(websiteUrl)
    if (!normalized) {
      setErrors({ ...errors, websiteUrl: "Please enter a valid website address." })
      return
    }

    setErrors({ ...errors, websiteUrl: null })
    setIsLoading(true)
    try {
      const res = await fetch(`${api}/website-scrape?url=${encodeURIComponent(normalized)}`, {
        credentials: 'include',
      })
      const data = await res.json()
      //alert(`Website scraped: ${JSON.stringify(data)}`)
      await fetchBrandSummary()
    } catch (err) {
      alert('Failed to scrape website.')
    } finally {
      setIsLoading(false)
    }
  }

  const validateAndNextStep = async () => {
    const stepConfig = manualSteps[manualStep]
    const value = brandInfo[stepConfig.key].trim()
    const isOptional = stepConfig.optional
    const newErrors = { ...errors }

    if (!isOptional && (value.length < stepConfig.min || value.length > stepConfig.max)) {
      newErrors[stepConfig.key] = `${stepConfig.label} must be between ${stepConfig.min} and ${stepConfig.max} characters.`
      setErrors(newErrors)
      return
    }

    if (isOptional && value.length > stepConfig.max) {
      newErrors[stepConfig.key] = `${stepConfig.label} must be at most ${stepConfig.max} characters.`
      setErrors(newErrors)
      return
    }

    setErrors({})
    const nextStep = manualStep + 1

    if (nextStep < manualSteps.length) {
      setManualStep(nextStep)
    } else {
      await handleManualSubmit()
    }
  }

  const handleManualSubmit = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${api}/upload-brand-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandInfo),
        credentials: 'include',
      })
      const data = await res.json()
      //alert(`Brand uploaded: ${JSON.stringify(data)}`)
      await fetchBrandSummary()
    } catch (err) {
      alert('Failed to upload brand info.')
    } finally {
      setIsLoading(false)
    }
  }
useEffect(() => {
  if (step === 'finalizing') {
    const timer = setTimeout(() => {
      window.location.href = '/home'
    }, 1500)
    return () => clearTimeout(timer)
  }
}, [step])
  return (
    <div style={styles.container}>
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <img
            src="https://i.gifer.com/ZZ5H.gif"
            alt="Loading..."
            style={styles.spinner}
          />
        </div>
      )}

      <h2>Let’s learn about your brand</h2>

      {step === 'intro' && hasWebsite && (
        <>
          <input
            type="text"
            placeholder="Enter your website URL"
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value)
              setErrors({ ...errors, websiteUrl: null })
            }}
            style={styles.input}
          />
          {errors.websiteUrl && <p style={styles.error}>{errors.websiteUrl}</p>}
          <button onClick={handleWebsiteSubmit} style={styles.button}>Continue</button>
          <p style={styles.toggle} onClick={() => setHasWebsite(false)}>
            Don’t have a website? Click here instead
          </p>
        </>
      )}

      {step === 'intro' && !hasWebsite && (
        <>
          {manualStep < manualSteps.length && (
            <>
              <label>{manualSteps[manualStep].label}</label>
              {manualSteps[manualStep].type === 'textarea' ? (
                <textarea
                  value={brandInfo[manualSteps[manualStep].key]}
                  onChange={(e) => {
                    setBrandInfo({ ...brandInfo, [manualSteps[manualStep].key]: e.target.value })
                    setErrors({ ...errors, [manualSteps[manualStep].key]: null })
                  }}
                  style={styles.textarea}
                />
              ) : (
                <input
                  type="text"
                  value={brandInfo[manualSteps[manualStep].key]}
                  onChange={(e) => {
                    setBrandInfo({ ...brandInfo, [manualSteps[manualStep].key]: e.target.value })
                    setErrors({ ...errors, [manualSteps[manualStep].key]: null })
                  }}
                  style={styles.input}
                />
              )}
              {errors[manualSteps[manualStep].key] && (
                <p style={styles.error}>{errors[manualSteps[manualStep].key]}</p>
              )}
              <button onClick={validateAndNextStep} style={styles.button}>Next</button>
              <p style={styles.toggle} onClick={() => setHasWebsite(true)}>
                Actually, I do have a website
              </p>
            </>
          )}
        </>
      )}

      {step === 'summary' && (
        <>
          <h3>Here’s your brand summary! You can edit it below.</h3>
          <textarea
            value={brandSummary}
            onChange={(e) => setBrandSummary(e.target.value)}
            style={{ ...styles.textarea, minHeight: '150px' }}
          />
          <button onClick={handleConfirmBrandSummary} style={styles.button}>Save & Continue</button>
        </>
      )}

      {step === 'tone' && (
        <>
          <h3>Let’s personalize your email tone</h3>
          <p>
            We can analyze a few of your recent emails to better understand how you write — things like your tone, style, and common phrases.
          </p>
          <p>
            This helps us make sure the emails we generate actually sound like you. If you skip this, the tone may sound generic.
          </p>

          <button
            onClick={async () => {
              try {
                setIsLoading(true)
                const res = await fetch(`${api}/crawl-emails`, {
                  credentials: 'include'
                })
                const data = await res.json()
                await fetchSignature()
              } catch (err) {
                alert('Error crawling emails.')
              } finally {
                setIsLoading(false)
              }
            }}
            style={styles.button}
          >
            Yes, crawl my emails
          </button>

          <button
            onClick={async () => {
              try {
                setIsLoading(true)
                const res = await fetch(`${api}/set-generic-tone`, {
                  method: 'POST',
                  credentials: 'include'
                })
                const data = await res.json()
                await fetchSignature()
              } catch (err) {
                alert('Error setting generic tone.')
              } finally {
                setIsLoading(false)
              }
            }}
            style={{ ...styles.button, backgroundColor: '#ccc', color: '#000' }}
          >
            No, just use a default tone
          </button>
        </>
      )}
      {step === 'signature' && (
  <>
    <h3>Edit your email signature</h3>
    <SignatureEditor
      value={signature}
      setValue={setSignature}
      onBack={() => setStep('tone')}
      onSave={updateSignature}
    />
  </>
)}

{step === 'inventory' && (
  <>
    <h3>Add your products or services</h3>
    <InventoryPage
      embedded={true}
      onBack={() => setStep('signature')}   // 👈 go back to signature step
      onNext={() => setStep('monitoringConsent')}    // 👈 future next step
    />
  </>
)}

{step === 'monitoringConsent' && (
  <div style={{ maxWidth: '700px', margin: 'auto' }}>
    <h2>Can We Monitor and Draft Emails for You?</h2>
    <p>
      This is the heart of our service — we need your permission to monitor incoming emails and draft
      replies on your behalf. Without this, we won’t be able to detect new messages or help you write
      responses. If you decline, your account will be terminated.
    </p>

    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
  <button
    style={{ padding: '0.5rem 1rem', background: '#f44336', color: 'white' }}
    onClick={async () => {
      const confirmed = window.confirm(
        '⚠️ WARNING: This action is IRREVERSIBLE.\n\nAre you absolutely sure you want to permanently delete your account and all associated data?\n\nThis cannot be undone.'
      )
      if (!confirmed) return

      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/delete`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        alert('Your account has been deleted. Goodbye 🫡')
        window.location.href = '/'
      } else {
        alert('Something went wrong while deleting your account.')
      }
    }}
  >
    ❌ No Thanks — Delete My Account
  </button>

  <button
    onClick={async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/start-monitoring`, {
    method: 'POST',
    credentials: 'include'
  })

  if (res.ok) {
    // ✅ Mark onboarding as complete
    await fetch(`${import.meta.env.VITE_API_URL}/finish-onboarding`, {
      method: 'POST',
      credentials: 'include'
    })

    setStep('finalizing')
  } else {
    alert('Something went wrong enabling monitoring.')
  }
}}

  >
    ✅ Yes, Start Monitoring!
  </button>
</div>

  </div>
)}


{step === 'finalizing' && (
  <div style={{ textAlign: 'center', padding: '4rem' }}>
    <h2>🎉 Setting up your profile...</h2>
    <p>Hang tight, this will only take a second.</p>
    <img
      src="https://i.gifer.com/ZZ5H.gif"
      alt="Loading"
      style={{ width: '60px', marginTop: '1.5rem' }}
    />

  </div>
)}

      
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative'
  },
  input: {
    padding: '10px',
    fontSize: '16px'
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    minHeight: '60px'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#222',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  toggle: {
    color: '#4285F4',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  error: {
    color: 'red',
    marginTop: '-0.5rem',
    fontSize: '0.875rem'
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  spinner: {
    width: '80px',
    height: '80px'
  }
}

export default Onboarding
