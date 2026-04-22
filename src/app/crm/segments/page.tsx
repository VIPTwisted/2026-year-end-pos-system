'use client'
import { useEffect, useState, useCallback } from 'react'
import { Users, RefreshCw, Trash2, Pencil, Plus, X, Check } from 'lucide-react'

interface Segment {
  id: string
  name: string
  description?: string
  segmentType: string
  criteria: string
  memberCount: number
  lastRefreshed?: string
  campaigns: { id: string }[]
  createdAt: string
}

interface Criterion { key: string; label: string; value: string }

const CRITERION_OPTIONS = [
  { key: 'minLTV', label: 'Min LTV ($)', type: 'number', placeholder: '500' },
  { key: 'maxLTV', label: 'Max LTV ($)', type: 'number', placeholder: '10000' },
  { key: 'lastPurchaseDays', label: 'Last Purchase within (days)', type: 'number', placeholder: '30' },
  { key: 'tier', label: 'Customer Tier', type: 'select', options: ['VIP', 'Premium', 'Standard'] },
  { key: 'location', label: 'Location / Store', type: 'text', placeholder: 'Downtown' },
  { key: 'hasLoyaltyCard', label: 'Has Loyalty Card', type: 'select', options: ['yes', 'no'] },
]

function estimateCount(criteria: Record<string, string>): number {
  let base = 3200
  if (criteria.minLTV) base = Math.floor(base * 0.6)
  if (criteria.maxLTV) base = Math.floor(base * 0.8)
  if (criteria.tier === 'VIP') base = Math.floor(base * 0.15)
  if (criteria.tier === 'Premium') base = Math.floor(base * 0.35)
  if (criteria.lastPurchaseDays) base = Math.floor(base * 0.7)
  if (criteria.hasLoyaltyCard === 'yes') base = Math.floor(base * 0.55)
  return Math.max(1, base)
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [critKey, setCritKey] = useState(CRITERION_OPTIONS[0].key)
  const [critVal, setCritVal] = useState('')
  const [form, setForm] = useState({ name: '', description: '', segmentType: 'static' })

  const load = useCallback(() => {
    fetch('/api/crm/segments').then(r => r.json()).then(d => { setSegments(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  function addCriterion() {
    if (!critVal.trim()) return
    const opt = CRITERION_OPTIONS.find(o => o.key === critKey)
    if (!opt) return
    setCriteria(prev => [...prev.filter(c => c.key !== critKey), { key: critKey, label: opt.label, value: critVal }])
    setCritVal('')
  }

  function removeCrit(key: string) { setCriteria(prev => prev.filter(c => c.key !== key)) }

  const criteriaObj = criteria.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {} as Record<string, string>)
  const preview = form.segmentType === 'dynamic' ? estimateCount(criteriaObj) : null

  async function save() {
    const payload = { name: form.name, description: form.description || null, segmentType: form.segmentType, criteria: form.segmentType === 'dynamic' ? criteriaObj : {} }
    if (editId) {
      await fetch(`/api/crm/segments/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/crm/segments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setShowForm(false); setEditId(null); setForm({ name: '', description: '', segmentType: 'static' }); setCriteria([]); load()
  }

  async function del(id: string) {
    if (!confirm('Delete segment?')) return
    await fetch(`/api/crm/segments/${id}`, { method: 'DELETE' })
    load()
  }

  async function refresh(id: string) {
    setRefreshing(id)
    await fetch(`/api/crm/segments/${id}/refresh`, { method: 'POST' })
    setRefreshing(null); load()
  }

  function startEdit(s: Segment) {
    setForm({ name: s.name, description: s.description ?? '', segmentType: s.segmentType })
    const crit = JSON.parse(s.criteria || '{}')
    setCriteria(Object.entries(crit).map(([k, v]) => {
      const opt = CRITERION_OPTIONS.find(o => o.key === k)
      return { key: k, label: opt?.label ?? k, value: String(v) }
    }))
    setEditId(s.id); setShowForm(true)
  }

  const selectedCritOpt = CRITERION_OPTIONS.find(o => o.key === critKey)

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><Users className="w-6 h-6 text-blue-400" /> Customer Segments</h1>
          <p className="text-zinc-500 text-sm">{segments.length} segments</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', segmentType: 'static' }); setCriteria([]) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Segment
        </button>
      </div>
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">{editId ? 'Edit Segment' : 'New Segment'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VIP Customers"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Segment Type</label>
              <div className="flex gap-2">
                {['static', 'dynamic'].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, segmentType: t }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${form.segmentType === t ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          {form.segmentType === 'dynamic' && (
            <div className="space-y-3 border-t border-zinc-800 pt-4">
              <div className="text-xs text-zinc-400 font-medium">Criteria Builder</div>
              <div className="flex gap-2 flex-wrap">
                <select value={critKey} onChange={e => { setCritKey(e.target.value); setCritVal('') }}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                  {CRITERION_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
                {selectedCritOpt?.type === 'select' ? (
                  <select value={critVal} onChange={e => setCritVal(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Select...</option>
                    {selectedCritOpt.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={critVal} onChange={e => setCritVal(e.target.value)}
                    placeholder={selectedCritOpt?.placeholder ?? ''} type={selectedCritOpt?.type ?? 'text'}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 w-40" />
                )}
                <button onClick={addCriterion} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">Add</button>
              </div>
              {criteria.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {criteria.map(c => (
                    <div key={c.key} className="flex items-center gap-1 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300">
                      <span className="text-zinc-500">{c.label}:</span> <span>{c.value}</span>
                      <button onClick={() => removeCrit(c.key)} className="text-zinc-500 hover:text-red-400 ml-1"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              {preview !== null && <div className="text-sm text-blue-400 font-medium">~ {preview.toLocaleString()} customers match</div>}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={save} disabled={!form.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Check className="w-4 h-4" /> {editId ? 'Save Changes' : 'Create Segment'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Name', 'Type', 'Members', 'Last Refreshed', 'Campaigns', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
              : segments.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">No segments yet</td></tr>
              : segments.map(s => (
                <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-100">{s.name}</div>
                    {s.description && <div className="text-xs text-zinc-500 mt-0.5">{s.description}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.segmentType === 'dynamic' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-300'}`}>{s.segmentType}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 font-medium">{s.memberCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{s.lastRefreshed ? new Date(s.lastRefreshed).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.campaigns.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => refresh(s.id)} disabled={refreshing === s.id}
                        className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors">
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing === s.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button onClick={() => startEdit(s)} className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => del(s.id)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
