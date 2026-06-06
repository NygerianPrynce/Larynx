import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const api = import.meta.env.VITE_API_URL

export default function Outreach() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const [query, setQuery] = useState('catering companies')
  const [cities, setCities] = useState('Nashville, TN, Franklin, TN, Brentwood, TN')
  const [limit, setLimit] = useState(20)

  const [leads, setLeads] = useState([])
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  // Gate: only admins can use this page
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${api}/admin/status`, { credentials: 'include' })
        const d = await r.json()
        setIsAdmin(!!d.is_admin)
        if (d.is_admin) loadLeads()
      } catch (e) { /* ignore */ }
      finally { setChecked(true) }
    })()
  }, [])

  const loadLeads = async () => {
    try {
      const r = await fetch(`${api}/admin/outreach/leads`, { credentials: 'include' })
      const d = await r.json()
      setLeads(d.leads || [])
    } catch (e) { /* ignore */ }
  }

  const runSearch = async () => {
    setBusy('search'); setMsg('')
    try {
      const cityList = cities.split(',').map(s => s.trim()).filter(Boolean)
      // rejoin into "City, ST" pairs is the user's responsibility; we send raw comma list
      const r = await fetch(`${api}/admin/outreach/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query, cities: cityList, limit: Number(limit) }),
      })
      const d = await r.json()
      setMsg(`Found ${d.found}, saved ${d.saved} leads.`)
      await loadLeads()
    } catch (e) { setMsg('Search failed.') }
    finally { setBusy('') }
  }

  const createDrafts = async () => {
    setBusy('drafts'); setMsg('')
    try {
      const r = await fetch(`${api}/admin/outreach/create-drafts`, {
        method: 'POST', credentials: 'include',
      })
      const d = await r.json()
      setMsg(`Created ${d.drafts_created} Gmail drafts (of ${d.eligible} eligible). Check your Drafts.`)
      await loadLeads()
    } catch (e) { setMsg('Draft creation failed.') }
    finally { setBusy('') }
  }

  const downloadCsv = () => {
    const header = ['Name', 'Website', 'Email', 'Subject', 'Body', 'Draft Created']
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = leads.map(l => [l.name, l.website, l.email, l.subject, l.body, l.draft_created].map(esc).join(','))
    const blob = new Blob([header.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'outreach_leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (!checked) {
    return <div className="min-h-screen bg-gray-50" />
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center text-gray-500">
          Not found.
        </div>
      </div>
    )
  }

  const withEmail = leads.filter(l => l.email).length
  const drafted = leads.filter(l => l.draft_created).length

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Outreach</h1>
        <p className="text-gray-600 mb-8">Admin-only. Find local businesses, scrape emails, personalize, and draft in your inbox.</p>

        {/* Search controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search query</label>
              <input value={query} onChange={e => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cities (comma-separated)</label>
              <input value={cities} onChange={e => setCities(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
              <input type="number" value={limit} onChange={e => setLimit(e.target.value)} min="1" max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={runSearch} disabled={!!busy}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              {busy === 'search' ? 'Finding…' : 'Find leads'}
            </button>
            <button onClick={createDrafts} disabled={!!busy || withEmail === 0}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">
              {busy === 'drafts' ? 'Drafting…' : 'Create Gmail drafts'}
            </button>
            <button onClick={downloadCsv} disabled={leads.length === 0}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium disabled:opacity-50">
              Download CSV
            </button>
          </div>
          {msg && <p className="text-sm text-gray-600 mt-3">{msg}</p>}
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm text-gray-600 mb-4">
          <span><b className="text-gray-900">{leads.length}</b> leads</span>
          <span><b className="text-gray-900">{withEmail}</b> with email</span>
          <span><b className="text-gray-900">{drafted}</b> drafted</span>
        </div>

        {/* Leads table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3">Business</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Email preview</th>
                <th className="text-left p-3">Draft</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} className="border-t border-gray-100 align-top">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{l.name}</div>
                    <a href={l.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600">{l.website}</a>
                  </td>
                  <td className="p-3">{l.email || <span className="text-red-500">none</span>}</td>
                  <td className="p-3 text-gray-700 max-w-md"><pre className="whitespace-pre-wrap font-sans text-xs">{l.body}</pre></td>
                  <td className="p-3">{l.draft_created ? '✅' : '—'}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan="4" className="p-6 text-center text-gray-400">No leads yet — run a search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
