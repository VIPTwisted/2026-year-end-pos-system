'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { UserPlus, Plus, X, Check, ChevronDown } from 'lucide-react'

interface Lead {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  source: string
  status: string
  score: number
  assignedTo?: string
  createdAt: string
}

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost']
const SOURCES = ['web', 'referral', 'social', 'event', 'cold-call', 'walk-in']

const SOURCE_COLORS: Record<string, string> = {
  web: 'bg-blue-500/20 text-blue-400',
  referral: 'bg-green-500/20 text-green-400',
  social: 'bg-pink-500/20 text-pink-400',
  event: 'bg-purple-500/20 text-purple-400',
  'cold-call': 'bg-orange-500/20 text-orange-400',
  'walk-in': 'bg-cyan-500/20 text-cyan-400',
}

const STATUS_COLS = [
  { key: 'new', label: 'New', color: 'text-zinc-400', border: 'border-zinc-700' },
  { key: 'contacted', label: 'Contacted', color: 'text-blue-400', border: 'border-blue-800' },
  { key: 'qualified', label: 'Qualified', color: 'text-green-400', border: 'border-green-800' },
  { key: 'converted', label: 'Converted', color: 'text-purple-400', border: 'border-purple-800' },
  { key: 'lost', label: 'Lost', color: 'text-red-400', border: 'border-red-900' },
]

const BLANK_FORM = { firstName: '', lastName: '', email: '', phone: '', company: '', source: 'web', status: 'new', score: 0, assignedTo: '', notes: '' }

function fullName(l: Lead) {
  return [l.firstName, l.lastName].filter(Boolean).join(' ') || 'Unnamed Lead'
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [moveMenuId, setMoveMenuId] = useState<string | null>(null)
  const [form, setForm] = useState(BLANK_FORM)

  const load = useCallback(() => {
    fetch('/api/crm/leads').then(r => r.json()).then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  function setF(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    await fetch('/api/crm/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowForm(false)
    setForm(BLANK_FORM)
    load()
  }

  async function moveTo(id: string, status: string) {
    await fetch(`/api/crm/leads/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    setMoveMenuId(null)
    load()
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeek = leads.filter(l => l.status === 'new' && new Date(l.createdAt) >= weekAgo).length
  const qualified = leads.filter(l => l.status === 'qualified').length
  const converted = leads.filter(l => l.status === 'converted').length
  const convRate = leads.length > 0 ? ((converted / leads.length) * 100).toFixed(1) : '0.0'
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0

  const kpis = [
    { label: 'New This Week', value: newThisWeek },
    { label: 'Qualified', value: qualified },
    { label: 'Conversion Rate', value: `${convRate}%` },
    { label: 'Avg Score', value: avgScore },
  ]

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-400" /> Lead Management
          </h1>
          <p className="text-zinc-500 text-sm">{leads.length} total leads</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Lead
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{k.label}</div>
            <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : k.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">New Lead</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'First Name', key: 'firstName', type: 'text' },
              { label: 'Last Name', key: 'lastName', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Company', key: 'company', type: 'text' },
              { label: 'Assigned To', key: 'assignedTo', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form] as string}
                  onChange={e => setF(f.key, e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Source</label>
              <select value={form.source} onChange={e => setF('source', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Score (0-100)</label>
              <input type="number" min={0} max={100} value={form.score}
                onChange={e => setF('score', parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Check className="w-4 h-4" /> Create Lead
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-zinc-600 py-16">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUS_COLS.map(col => {
            const colLeads = leads.filter(l => l.status === col.key)
            return (
              <div key={col.key} className={`bg-zinc-900 border ${col.border} rounded-xl flex flex-col`}>
                <div className={`px-4 py-3 border-b border-zinc-800 flex items-center justify-between`}>
                  <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">{colLeads.length}</span>
                </div>
                <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[60vh]">
                  {colLeads.length === 0 && <div className="text-xs text-zinc-700 text-center py-4">Empty</div>}
                  {colLeads.map(lead => (
                    <div key={lead.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
                      <Link href={`/crm/leads/${lead.id}`} className="font-medium text-zinc-100 hover:text-blue-400 text-sm block">
                        {fullName(lead)}
                      </Link>
                      {lead.company && <div className="text-xs text-zinc-500">{lead.company}</div>}
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SOURCE_COLORS[lead.source] ?? 'bg-zinc-700 text-zinc-300'}`}>{lead.source}</span>
                        {lead.assignedTo && <span className="text-xs text-zinc-600">{lead.assignedTo}</span>}
                      </div>
                      <div>
                        <div className="text-xs text-zinc-600 mb-1">Score: {lead.score}</div>
                        <div className="w-full bg-zinc-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${lead.score >= 70 ? 'bg-green-500' : lead.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${lead.score}%` }} />
                        </div>
                      </div>
                      <div className="relative">
                        <button onClick={() => setMoveMenuId(moveMenuId === lead.id ? null : lead.id)}
                          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                          Move to <ChevronDown className="w-3 h-3" />
                        </button>
                        {moveMenuId === lead.id && (
                          <div className="absolute z-10 left-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                            {STATUSES.filter(s => s !== lead.status).map(s => (
                              <button key={s} onClick={() => moveTo(lead.id, s)}
                                className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700 capitalize transition-colors">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
