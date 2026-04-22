'use client'

import { useEffect, useState } from 'react'
import { Plug, ExternalLink, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Partner {
  id: string; featureName: string; featureCategory: string; description: string
  thirdPartyName: string; estimatedCost: string | null; status: string; priority: string
  notes: string | null; nativeAlternative: string | null
}

const STATUS_STYLES: Record<string, string> = {
  backlog: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  evaluating: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  native_built: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  deprecated: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-zinc-600',
}

const CATEGORIES = ['', 'payments', 'email', 'messaging', 'fulfillment', 'tax', 'security', 'ai', 'crm', 'auth', 'infrastructure', 'location', 'productivity']

export default function IntegrationsPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/integrations/partners').then(r => r.json()).then(d => { setPartners(d); setLoading(false) })
  }, [])

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/integrations/partners/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
  }

  const filtered = partners.filter(p => {
    if (category && p.featureCategory !== category) return false
    if (status && p.status !== status) return false
    return true
  })

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Integration Collaboration Tracker</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} integrations · D365 Commerce ecosystem</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none">
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All categories'}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none">
          <option value="">All statuses</option>
          <option value="backlog">Backlog</option>
          <option value="evaluating">Evaluating</option>
          <option value="native_built">Native Built</option>
        </select>
        <div className="flex gap-2 ml-auto">
          {Object.entries(STATUS_STYLES).map(([s, cls]) => (
            <span key={s} className={cn('px-2 py-0.5 rounded text-xs border', cls)}>
              {partners.filter(p => p.status === s).length} {s.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-zinc-900 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-3 w-4"></th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Feature</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Category</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Third Party</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Est. Cost</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Native Alternative</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Status</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-zinc-600">
                  <Plug className="w-8 h-8 mx-auto mb-2 opacity-30" />No integrations match filters
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-zinc-900/50 group">
                  <td className="py-3 pr-3">
                    <div className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[p.priority] ?? 'bg-zinc-600')} />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-zinc-200">{p.featureName}</div>
                    <div className="text-zinc-600 mt-0.5 max-w-xs truncate">{p.description}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded capitalize">{p.featureCategory}</span>
                  </td>
                  <td className="py-3 pr-4 text-zinc-300 font-medium">{p.thirdPartyName}</td>
                  <td className="py-3 pr-4 text-zinc-500">{p.estimatedCost ?? '—'}</td>
                  <td className="py-3 pr-4 text-zinc-500 italic max-w-xs truncate">{p.nativeAlternative ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', STATUS_STYLES[p.status] ?? STATUS_STYLES.backlog)}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="relative inline-block">
                      <select
                        value={p.status}
                        onChange={e => updateStatus(p.id, e.target.value)}
                        className="appearance-none pl-2 pr-6 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-400 focus:outline-none cursor-pointer hover:border-zinc-600"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="evaluating">Evaluating</option>
                        <option value="native_built">Native Built</option>
                        <option value="deprecated">Deprecated</option>
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1 w-3 h-3 text-zinc-600 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
