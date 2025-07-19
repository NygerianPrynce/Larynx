// File: pages/SettingsPage.jsx
import React, { useEffect, useState } from 'react'
import SignatureEditor from './signatureEditor'
import Navbar from '../components/Navbar'


const SettingsPage = () => {
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const api = import.meta.env.VITE_API_URL
  const [summary, setSummary] = useState('')
  const [signature, setSignature] = useState('')
  const [name, setName] = useState('')


  useEffect(() => {
  const fetchAll = async () => {
    try {
      const [summaryRes, nameRes, sigRes] = await Promise.all([
        fetch(`${api}/get-brand-summary`, { credentials: 'include' }),
        fetch(`${api}/user/name`, { credentials: 'include' }),
        fetch(`${api}/signature`, { credentials: 'include' }),
      ])

      const summaryData = await summaryRes.json()
      const nameData = await nameRes.json()
      const sigData = await sigRes.json()

      setSummary(summaryData.summary || '')
      setName(nameData.name || '')
      setSignature(sigData.signature || '')
    } catch (err) {
      console.error('Error fetching settings data:', err)
    }
  }

  fetchAll()
}, [])

useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(timer)
  }
}, [success])

  const updateSummary = async () => {
    setSuccess('')
    setError('')
    await fetch(`${api}/update-brand-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ summary })
    })
    setSuccess('✅ Brand summary updated!')
  }

  const updateSignature = async () => {
    setSuccess('')
    setError('')
    await fetch(`${api}/signature`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ signature })
    })
    setSuccess('✅ Signature updated!')
  }

  const stopMonitoring = async () => {
    setSuccess('')
    setError('')
  const confirmStop = window.confirm(
    '⚠️ WARNING: If you stop monitoring, you will no longer receive email drafts or alerts. Your AI assistant will be DISABLED.\n\nAre you absolutely sure you want to do this?'
  )
  if (!confirmStop) return

  const res = await fetch(`${api}/stop-monitoring`, {
    method: 'POST',
    credentials: 'include'
  })

  if (res.ok) setSuccess('✅ Monitoring stopped!')
  else setError('❌ Failed to stop monitoring.')
}


  const deleteAccount = async () => {
    const confirm = window.confirm('Are you sure? This will permanently delete your account.')
    if (!confirm) return

    await fetch(`${api}/user/delete`, {
      method: 'DELETE',
      credentials: 'include'
    })
    window.location.href = '/'
  }

  return (
    <>
    <Navbar />
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>Settings</h2>
      {success && <p style={{ color: 'green' }}>{success}</p>}
    {error && <p style={{ color: 'red' }}>{error}</p>}
 <h4>👤 Update Your Name</h4>
 <input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter your name"
  style={{ width: '100%', padding: '0.5rem' }}
/>
<button onClick={async () => {
    setSuccess('')
setError('')
  const res = await fetch(`${api}/user/update-name`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ new_name: name })
  })
  if (res.ok) setSuccess('✅ Name updated!')
  else setError('❌ Failed to update name.')
}}>Update Name</button>

<h4>✏️ Edit Brand Summary</h4>
<textarea value={summary} onChange={(e) => setSummary(e.target.value)} style={{ width: '100%', height: '100px' }} />
<button onClick={updateSummary}>Save Summary</button>

<h4 style={{ marginTop: '2rem' }}>📬 Edit Email Signature</h4>
<SignatureEditor
  value={signature}
  setValue={setSignature}
  onBack={() => {}}
  onSave={updateSignature}
/>

<h4 style={{ marginTop: '2rem' }}>🔒 Account Management</h4>

<button onClick={deleteAccount} style={{ background: 'red', color: 'white' }}>Delete Account</button>
<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
  <button onClick={stopMonitoring}>Stop Monitoring</button>
  <button
    onClick={async () => {
      const res = await fetch(`${api}/start-monitoring`, {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        setSuccess('✅ Monitoring re-enabled!')
      } else {
        setError('❌ Failed to start monitoring.')
      }
    }}
  >
    Start Monitoring
  </button>
</div>

    </div>
    </>
  )
}

export default SettingsPage
