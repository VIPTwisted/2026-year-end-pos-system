'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Plus, Trash2, ExternalLink, Star, Edit2, Check, X } from 'lucide-react'

type Dashboard = {
  id: string; name: string; isDefault: boolean
  widgets: { id: string }[]; createdAt: string; updatedAt: string
}

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const load = () => {
    fetch('/api/analytics/dashboards').then(r => r.json()).then(d => { setDashboards(d); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const createDashboard = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/analytics/dashboards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const d = await res.json()
    setDashboards(prev => [d, ...prev])
    setNewName(''); setCreating(false)
    window.location.href = `/advanced-analytics/dashboards/${d.id}`
  }

  const deleteDashboard = async (id: string) => {
    if (!confirm('Delete this dashboard?')) return
    await fetch(`/api/analytics/dashboards/${id}`, { method: 'DELETE' })
    setDashboards(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboards</h1>
          <p className="text-sm text-zinc-400 mt-1">Custom widget dashboards — drag-free builder</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Dashboard
        </button>
      </div>

      {creating && (
        <div className="bg-zinc-900 border border-blue-600/50 rounded-xl p-5 flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-blue-400 shrink-0" />
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createDashboard(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Dashboard name..." className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 outline-none text-sm" />
          <button onClick={createDashboard} className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors"><Check className="w-4 h-4" /></button>
          <button onClick={() => setCreating(false)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading ? <div className="text-zinc-500 text-sm">Loading dashboards...</div> :
        dashboards.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
            <LayoutDashboard className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <div className="text-zinc-400 text-sm">No dashboards yet. Create one above.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboards.map(d => (
              <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-sm font-semibold text-zinc-100">{d.name}</span>
                  </div>
                  {d.isDefault && <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs"><Star className="w-3 h-3" /> Default</span>}
                </div>
                <div className="text-xs text-zinc-500 mb-4">{d.widgets.length} widget{d.widgets.length !== 1 ? 's' : ''} · Updated {new Date(d.updatedAt).toLocaleDateString()}</div>
                <div className="flex gap-2">
                  <Link href={`/advanced-analytics/dashboards/${d.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </Link>
                  <Link href={`/advanced-analytics/dashboards/${d.id}`} className="px-3 py-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg text-xs transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => deleteDashboard(d.id)} className="px-3 py-2 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 rounded-lg text-xs transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
