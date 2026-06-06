import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { METROS, CITIES_BY_STATE, STATES } from '../data/usCities'

const api = import.meta.env.VITE_API_URL

export default function Outreach() {
  const [checked, setChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const [query, setQuery] = useState('catering companies')
  const [state, setState] = useState('Tennessee')
  const [selectedCities, setSelectedCities] = useState([])
  const [perCity, setPerCity] = useState(5)

  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

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

  const toggleCity = (c) =>
    setSelectedCities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const addMetro = (metroCities) =>
    setSelectedCities(prev => Array.from(new Set([...prev, ...metroCities])))

  const runSearch = async () => {
    if (selectedCities.length === 0) { setMsg('Pick at least one city.'); return }
    setBusy('search'); setMsg('')
    try {
      const r = await fetch(`${api}/admin/outreach/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query, cities: selectedCities, per_city: Number(perCity) }),
      })
      const d = await r.json()
      setMsg(`Found ${d.found} businesses, saved ${d.saved} leads.`)
      await loadLeads()
    } catch (e) { setMsg('Search failed.') }
    finally { setBusy('') }
  }

  const createDrafts = async () => {
    setBusy('drafts'); setMsg('')
    try {
      const r = await fetch(`${api}/admin/outreach/create-drafts`, { method: 'POST', credentials: 'include' })
      const d = await r.json()
      setMsg(`Created ${d.drafts_created} Gmail drafts (of ${d.eligible} eligible). Check your Drafts.`)
      await loadLeads()
    } catch (e) { setMsg('Draft creation failed.') }
    finally { setBusy('') }
  }

  const downloadCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['Name', 'Website', 'Email', 'Subject', 'Body', 'Draft Created', 'Added']
    const rows = leads.map(l => [l.name, l.website, l.email, l.subject, l.body, l.draft_created, l.created_at].map(esc).join(','))
    const blob = new Blob([header.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'outreach_leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (!checked) return <div className="min-h-screen bg-gray-50" />
  if (!isAdmin) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-2xl mx-auto px-6 py-24 text-center text-gray-500">Not found.</div>
    </div>
  )

  const withEmail = leads.filter(l => l.email).length
  const drafted = leads.filter(l => l.draft_created).length
  const shown = leads.filter(l =>
    filter === 'all' ? true :
    filter === 'email' ? !!l.email :
    filter === 'drafted' ? l.draft_created :
    filter === 'undrafted' ? !l.draft_created : true
  )
  const fmtDate = (s) => { try { return new Date(s).toLocaleDateString() } catch { return '' } }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Outreach</h1>
        <p className="text-gray-600 mb-8">Admin-only. Find local businesses, scrape emails, personalize, and draft straight into your inbox.</p>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What are you searching for?</label>
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="catering companies"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max results per city</label>
              <input type="number" min="1" max="60" value={perCity} onChange={e => setPerCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          {/* Metro presets */}
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick metros (covers the whole surrounding ring)</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(METROS).map(([name, cs]) => (
              <button key={name} onClick={() => addMetro(cs)}
                className="px-3 py-1.5 text-sm border border-purple-300 text-purple-700 rounded-full hover:bg-purple-50">
                + {name}
              </button>
            ))}
          </div>

          {/* State -> cities */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select value={state} onChange={e => setState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500">
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cities (click to add)</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {(CITIES_BY_STATE[state] || []).map(c => {
                  const on = selectedCities.includes(c)
                  return (
                    <button key={c} onClick={() => toggleCity(c)}
                      className={`px-2.5 py-1 text-xs rounded-full border ${on ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                      {c.replace(/, [A-Z]{2}$/, '')}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Selected */}
          {selectedCities.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{selectedCities.length} cities selected</span>
                <button onClick={() => setSelectedCities([])} className="text-xs text-gray-500 hover:text-gray-700 underline">clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCities.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-full">
                    {c}
                    <button onClick={() => toggleCity(c)} className="text-purple-400 hover:text-purple-700">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-5">
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

        {/* Tracker */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex gap-6 text-sm text-gray-600">
            <span><b className="text-gray-900">{leads.length}</b> leads</span>
            <span><b className="text-gray-900">{withEmail}</b> with email</span>
            <span><b className="text-green-600">{drafted}</b> drafted</span>
            <span><b className="text-amber-600">{withEmail - drafted}</b> ready to draft</span>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="all">All</option>
            <option value="email">With email</option>
            <option value="undrafted">Not yet drafted</option>
            <option value="drafted">Drafted</option>
          </select>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3">Business</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Added</th>
                <th className="text-left p-3">Email preview</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(l => (
                <tr key={l.id} className="border-t border-gray-100 align-top">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{l.name}</div>
                    <a href={l.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600">{l.website}</a>
                  </td>
                  <td className="p-3">{l.email || <span className="text-red-500">none</span>}</td>
                  <td className="p-3">
                    {l.draft_created
                      ? <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Draft created</span>
                      : l.email
                        ? <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">Ready</span>
                        : <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">No email</span>}
                  </td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">{fmtDate(l.created_at)}</td>
                  <td className="p-3 text-gray-700 max-w-md"><pre className="whitespace-pre-wrap font-sans text-xs">{l.body}</pre></td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">No leads — run a search above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
