'use client'
import { useEffect, useState } from 'react'
import { Ban, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react'

interface Exclusion {
  id: string
  locationId: string | null
  locationName: string | null
  reason: string
  startDate: string
  endDate: string | null
  isActive: boolean
  createdAt: string
}

export default function DomExclusionsPage() {
  const [exclusions, setExclusions] = useState<Exclusion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [locationName, setLocationName] = useState('')
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/dom/exclusions')
      setExclusions(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function addExclusion() {
    if (!locationName.trim() || !reason.trim() || !startDate) {
      setError('Location name, reason, and start date are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/dom/exclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationName, reason, startDate, endDate: endDate || null }),
      })
      if (!res.ok) throw new Error('Failed')
      setLocationName(''); setReason(''); setStartDate(''); setEndDate('')
      setShowForm(false)
      load()
    } catch { setError('Failed to create exclusion') } finally { setSaving(false) }
  }

  async function deleteExclusion(id: string) {
    if (!confirm('Delete this exclusion?')) return
    setDeleting(id)
    await fetch(`/api/dom/exclusions/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  function getStatus(excl: Exclusion): { label: string; cls: string } {
    const now = new Date()
    const start = new Date(excl.startDate)
    const end = excl.endDate ? new Date(excl.endDate) : null
    if (!excl.isActive) return { label: 'Inactive', cls: 'bg-zinc-800 text-zinc-500' }
    if (end && end < now) return { label: 'Expired', cls: 'bg-zinc-800 text-zinc-500' }
    if (start > now) return { label: 'Scheduled', cls: 'bg-yellow-900/40 text-yellow-400' }
    return { label: 'Active', cls: 'bg-red-900/40 text-red-400' }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center">
            <Ban className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Location Exclusions</h1>
            <p className="text-sm text-zinc-500">Prevent locations from receiving DOM-routed orders</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-800/60 hover:bg-red-700/60 border border-red-800/60 text-red-300 text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />Add Exclusion
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">New Exclusion</h2>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-950/40 border border-red-900/40 rounded-lg text-red-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />{error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Location Name</label>
              <input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Downtown Flagship"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Reason</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Renovations, Low inventory"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">End Date (optional)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowForm(false); setError('') }}
              className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm transition-colors">Cancel</button>
            <button onClick={addExclusion} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-700/70 hover:bg-red-600/70 disabled:opacity-50 text-white rounded-lg text-sm transition-colors">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Add Exclusion
            </button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium">End Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-600"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…</td></tr>
              ) : exclusions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-600">No exclusions configured.</td></tr>
              ) : exclusions.map((excl) => {
                const status = getStatus(excl)
                return (
                  <tr key={excl.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 text-zinc-200 font-medium">{excl.locationName ?? excl.locationId ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{excl.reason}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-xs">{new Date(excl.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-zinc-500 text-xs">{excl.endDate ? new Date(excl.endDate).toLocaleDateString() : 'Indefinite'}</td>
                    <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-medium ${status.cls}`}>{status.label}</span></td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => deleteExclusion(excl.id)} disabled={deleting === excl.id}
                        className="text-zinc-600 hover:text-red-400 transition-colors">
                        {deleting === excl.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
