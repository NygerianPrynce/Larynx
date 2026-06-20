import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { METROS_BY_STATE, CITIES_BY_STATE, STATES } from '../data/usCities'

const api = import.meta.env.VITE_API_URL

const DEFAULT_PITCH =
  "I'm Fadhil, an engineering student at Vanderbilt, and I built a little tool called Larynx to take some of the email load off your plate. When a quote request or booking question comes in, it writes a draft reply in your own voice, so you're not starting from scratch.\n\nYou stay in control the whole time. Larynx only writes the draft and leaves it in your inbox. Nothing sends unless you send it. I'm letting a few local businesses try it free while I keep improving it.\n\nIf you're curious, I'd love to show you how it works. No pressure at all."
const DEFAULT_SUBJECT = "Free inbox help, from a Vanderbilt student"

const BTN = "px-2.5 py-1 text-xs rounded-md border font-medium"

// Email cell: shows the address (with edit), or an inline add-box when none was scraped.
function EmailCell({ l, onSave }) {
  const [val, setVal] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    const v = val.trim()
    if (!v) return
    setSaving(true); setErr('')
    try { await onSave(l.id, v); setEditing(false) }
    catch (e) { setErr(e.message || 'error') }
    finally { setSaving(false) }
  }

  if (l.email && !editing) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-gray-700">{l.email}</span>
        <button onClick={() => { setVal(l.email); setEditing(true) }}
          className="text-xs text-gray-400 hover:text-gray-600">edit</button>
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center gap-1">
        <input value={val} onChange={e => setVal(e.target.value)} autoFocus
          type="email" placeholder="name@business.com"
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setEditing(false) }}
          className="w-44 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400" />
        <button onClick={submit} disabled={saving || !val.trim()}
          className={`${BTN} border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-40`}>
          {saving ? '…' : 'Save'}
        </button>
        {l.email && (
          <button onClick={() => setEditing(false)}
            className="text-xs text-gray-400 hover:text-gray-600">cancel</button>
        )}
      </div>
      {err && <div className="text-xs text-red-500 mt-0.5">{err}</div>}
    </div>
  )
}

export default function Outreach() {
  const [checked, setChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const [query, setQuery] = useState('catering companies')
  const [state, setState] = useState('Tennessee')
  const [selectedCities, setSelectedCities] = useState([])
  const [perCity, setPerCity] = useState(5)
  const [pitch, setPitch] = useState(() => localStorage.getItem('outreach_pitch_v4') || DEFAULT_PITCH)
  const [subject, setSubject] = useState(() => localStorage.getItem('outreach_subject_v4') || DEFAULT_SUBJECT)
  const [temp, setTemp] = useState(() => Number(localStorage.getItem('outreach_temp_v4') ?? 0.4))

  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [blacklist, setBlacklist] = useState([])
  const [showBlacklist, setShowBlacklist] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${api}/admin/status`, { credentials: 'include' })
        const d = await r.json()
        setIsAdmin(!!d.is_admin)
        if (d.is_admin) { loadLeads(); loadBlacklist() }
      } catch (e) { /* ignore */ } finally { setChecked(true) }
    })()
  }, [])

  useEffect(() => { localStorage.setItem('outreach_pitch_v4', pitch) }, [pitch])
  useEffect(() => { localStorage.setItem('outreach_subject_v4', subject) }, [subject])
  useEffect(() => { localStorage.setItem('outreach_temp_v4', String(temp)) }, [temp])

  const loadLeads = async () => {
    try {
      const r = await fetch(`${api}/admin/outreach/leads`, { credentials: 'include' })
      const d = await r.json()
      setLeads(d.leads || [])
    } catch (e) { /* ignore */ }
  }

  const loadBlacklist = async () => {
    try {
      const r = await fetch(`${api}/admin/outreach/blacklist`, { credentials: 'include' })
      const d = await r.json()
      setBlacklist(d.blacklist || [])
    } catch (e) { /* ignore */ }
  }

  const blacklistLead = async (id) => {
    try {
      await fetch(`${api}/admin/outreach/blacklist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ id }),
      })
      await Promise.all([loadLeads(), loadBlacklist()])
    } catch (e) { /* ignore */ }
  }

  const unblacklist = async (entryId) => {
    try {
      await fetch(`${api}/admin/outreach/blacklist/${entryId}`, { method: 'DELETE', credentials: 'include' })
      await loadBlacklist()
    } catch (e) { /* ignore */ }
  }

  const toggleCity = (c) => setSelectedCities(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const addMetro = (cs) => setSelectedCities(p => Array.from(new Set([...p, ...cs])))

  const runSearch = async () => {
    if (selectedCities.length === 0) { setMsg('Pick at least one city.'); return }
    setBusy('search'); setMsg('')
    try {
      const r = await fetch(`${api}/admin/outreach/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ query, cities: selectedCities, per_city: Number(perCity), pitch, subject, temperature: Number(temp) }),
      })
      const d = await r.json()
      setMsg(`Added ${d.new} new leads — up to ${perCity}/city across ${selectedCities.length} ${selectedCities.length === 1 ? 'city' : 'cities'} (duplicates & blacklisted skipped).`)
      await loadLeads()
    } catch (e) { setMsg('Search failed.') } finally { setBusy('') }
  }

  const createDrafts = async () => {
    setBusy('drafts'); setMsg('')
    try {
      const r = await fetch(`${api}/admin/outreach/create-drafts`, { method: 'POST', credentials: 'include' })
      const d = await r.json()
      setMsg(`Created ${d.drafts_created} Gmail drafts (of ${d.eligible}). Check your Drafts.`)
      await loadLeads()
    } catch (e) { setMsg('Draft creation failed.') } finally { setBusy('') }
  }

  const update = async (id, status) => {
    try {
      await fetch(`${api}/admin/outreach/update`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ id, status }),
      })
      await loadLeads()
    } catch (e) { /* ignore */ }
  }

  const saveEmail = async (id, email) => {
    const r = await fetch(`${api}/admin/outreach/set-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id, email }),
    })
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || 'Failed to save email')
    await loadLeads()
  }

  const removeLead = async (id) => {
    try {
      await fetch(`${api}/admin/outreach/lead/${id}`, { method: 'DELETE', credentials: 'include' })
      await loadLeads()
    } catch (e) { /* ignore */ }
  }

  const followup = async (id) => {
    setBusy('fu' + id)
    try {
      const r = await fetch(`${api}/admin/outreach/followup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ id }),
      })
      const d = await r.json()
      setMsg(d.ok ? 'Follow-up draft created in your inbox.' : 'Follow-up failed.')
      await loadLeads()
    } catch (e) { setMsg('Follow-up failed.') } finally { setBusy('') }
  }

  const downloadCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['Name', 'Website', 'Email', 'Status', 'Sent At', 'Added']
    const rows = leads.map(l => [l.name, l.website, l.email, l.status, l.sent_at, l.created_at].map(esc).join(','))
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
  const sent = leads.filter(l => l.status === 'sent').length
  const replied = leads.filter(l => l.status === 'replied').length
  const shown = leads.filter(l =>
    filter === 'all' ? true :
    filter === 'email' ? !!l.email :
    filter === 'undrafted' ? (l.email && !l.draft_created) :
    filter === 'drafted' ? l.status === 'drafted' :
    filter === 'sent' ? l.status === 'sent' :
    filter === 'replied' ? l.status === 'replied' : true
  )

  const fmt = (s) => { try { return new Date(s).toLocaleDateString() } catch { return '' } }
  const ago = (s) => {
    if (!s) return ''
    const d = Math.floor((Date.now() - new Date(s)) / 86400000)
    return d <= 0 ? 'today' : d === 1 ? '1d ago' : `${d}d ago`
  }

  const Badge = ({ l }) => {
    if (l.status === 'replied') return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">Replied 🎉</span>
    if (l.status === 'sent') return <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">Sent · {ago(l.sent_at)}</span>
    if (l.status === 'drafted' || l.draft_created) return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Draft created</span>
    if (l.email) return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">Ready</span>
    return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">No email</span>
  }

  const btn = "px-2.5 py-1 text-xs rounded-md border font-medium"

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Outreach</h1>
        <p className="text-gray-600 mb-8">Admin-only. Find local businesses, scrape emails, personalize, and draft straight into your inbox.</p>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What are you searching for?</label>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="catering companies"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="from a Vanderbilt student"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New leads per city</label>
              <input type="number" min="1" max="60" value={perCity} onChange={e => setPerCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              <p className="text-xs text-gray-400 mt-1">
                Per <i>each</i> selected city. {selectedCities.length > 0 && `${selectedCities.length} selected → up to ${(Number(perCity) || 0) * selectedCities.length} total.`}
              </p>
            </div>
          </div>

          {/* Editable pitch */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Your pitch (goes after the personalized opener — edit per region)</label>
          <textarea value={pitch} onChange={e => setPitch(e.target.value)} rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 mb-1" />
          <p className="text-xs text-gray-400 mb-4">Each email = <i>“Hey [Business] team, [AI opener about them]. {`{your pitch}`}”</i>. Saved automatically.</p>

          {/* Opener warmth (temperature) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opener warmth: <span className="text-purple-700 font-semibold">{Number(temp).toFixed(2)}</span>
            </label>
            <input type="range" min="0" max="1" step="0.05" value={temp}
              onChange={e => setTemp(Number(e.target.value))}
              className="w-full max-w-md accent-purple-600" />
            <div className="flex justify-between max-w-md text-xs text-gray-400">
              <span>0 · safe &amp; consistent</span>
              <span>0.4 · default</span>
              <span>1 · warm &amp; varied</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Only affects the AI opener line. Higher = warmer but can get gushing.</p>
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

          {/* Quick presets for the selected state */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => addMetro(CITIES_BY_STATE[state] || [])}
              className="px-3 py-1.5 text-sm bg-white border border-purple-300 text-purple-700 rounded-full hover:bg-purple-50">
              + All {state} cities
            </button>
            {Object.entries(METROS_BY_STATE[state] || {}).map(([name, cs]) => (
              <button key={name} onClick={() => addMetro(cs)}
                className="px-3 py-1.5 text-sm bg-white border border-purple-300 text-purple-700 rounded-full hover:bg-purple-50">
                + {name}
              </button>
            ))}
          </div>

          {selectedCities.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{selectedCities.length} cities selected</span>
                <button onClick={() => setSelectedCities([])} className="text-xs text-gray-500 hover:text-gray-700 underline">clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCities.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-full">
                    {c}<button onClick={() => toggleCity(c)} className="text-purple-400 hover:text-purple-700">×</button>
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
            <button onClick={createDrafts} disabled={!!busy || withEmail === drafted}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">
              {busy === 'drafts' ? 'Drafting…' : 'Create Gmail drafts'}
            </button>
            <button onClick={downloadCsv} disabled={leads.length === 0}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium disabled:opacity-50">Download CSV</button>
          </div>
          {msg && <p className="text-sm text-gray-600 mt-3">{msg}</p>}
        </div>

        {/* Tracker */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-5 text-sm text-gray-600">
            <span><b className="text-gray-900">{leads.length}</b> leads</span>
            <span><b className="text-gray-900">{withEmail}</b> w/ email</span>
            <span><b className="text-green-600">{drafted}</b> drafted</span>
            <span><b className="text-purple-600">{sent}</b> sent</span>
            <span><b className="text-blue-600">{replied}</b> replied</span>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="all">All</option>
            <option value="email">With email</option>
            <option value="undrafted">Not yet drafted</option>
            <option value="drafted">Drafted</option>
            <option value="sent">Sent</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3 w-10">#</th>
                <th className="text-left p-3">Business</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Added</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l, i) => (
                <tr key={l.id} className="border-t border-gray-100 align-top">
                  <td className="p-3 text-gray-400 tabular-nums">{i + 1}</td>
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{l.name}</div>
                    <a href={l.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600">{l.website}</a>
                  </td>
                  <td className="p-3"><EmailCell l={l} onSave={saveEmail} /></td>
                  <td className="p-3"><Badge l={l} /></td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">{fmt(l.created_at)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {l.status === 'drafted' && (
                        <button onClick={() => update(l.id, 'sent')} className={`${btn} border-purple-300 text-purple-700 hover:bg-purple-50`}>Mark sent</button>
                      )}
                      {l.status === 'sent' && (
                        <>
                          <button onClick={() => update(l.id, 'replied')} className={`${btn} border-blue-300 text-blue-700 hover:bg-blue-50`}>Mark replied</button>
                          <button onClick={() => followup(l.id)} disabled={busy === 'fu' + l.id || l.followup_drafted}
                            className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50`}>
                            {l.followup_drafted ? 'Follow-up drafted' : busy === 'fu' + l.id ? 'Drafting…' : 'Draft follow-up'}
                          </button>
                        </>
                      )}
                      {l.status === 'replied' && (
                        <button onClick={() => followup(l.id)} disabled={busy === 'fu' + l.id}
                          className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50`}>
                          {busy === 'fu' + l.id ? 'Drafting…' : 'Draft follow-up'}
                        </button>
                      )}
                      {l.status === 'new' && <span className="text-xs text-gray-400">{l.email ? 'draft first' : 'no email'}</span>}
                      <button onClick={() => blacklistLead(l.id)} title="Hide and never re-add on future searches"
                        className={`${btn} border-gray-300 text-gray-600 hover:bg-gray-100`}>Block</button>
                      <button onClick={() => removeLead(l.id)} className={`${btn} border-red-200 text-red-600 hover:bg-red-50`}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No leads — run a search above.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Blacklist — companies hidden from the CRM and skipped on future searches */}
        <div className="mt-6">
          <button onClick={() => setShowBlacklist(s => !s)}
            className="text-sm text-gray-500 hover:text-gray-800">
            {showBlacklist ? '▾' : '▸'} Blacklist ({blacklist.length})
          </button>
          {showBlacklist && (
            <div className="mt-2 overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left p-3 w-10">#</th>
                    <th className="text-left p-3">Business</th>
                    <th className="text-left p-3">Website</th>
                    <th className="text-left p-3">Reason</th>
                    <th className="text-left p-3">Blocked</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blacklist.map((b, i) => (
                    <tr key={b.id} className="border-t border-gray-100">
                      <td className="p-3 text-gray-400 tabular-nums">{i + 1}</td>
                      <td className="p-3 text-gray-900">{b.name || <span className="text-gray-400">—</span>}</td>
                      <td className="p-3"><a href={b.website} target="_blank" rel="noreferrer" className="text-blue-600">{b.website}</a></td>
                      <td className="p-3 text-gray-500">{b.reason || '—'}</td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">{fmt(b.created_at)}</td>
                      <td className="p-3">
                        <button onClick={() => unblacklist(b.id)}
                          className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-50`}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {blacklist.length === 0 && (
                    <tr><td colSpan="6" className="p-6 text-center text-gray-400">Nothing blacklisted.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
