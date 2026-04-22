'use client'
import { useEffect, useState, useCallback } from 'react'
import { Zap, Play, User, Tag, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Enrichment {
  id: string
  enrichmentName: string
  provider: string
  enrichmentType: string
  status: string
  profilesEnriched: number
  lastRunAt: string | null
}

const PROVIDER_CARDS = [
  { key: 'demographics', label: 'Demographics', icon: User, desc: 'Age, income, household data from third-party providers', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'brandAffinities', label: 'Brand Affinities', icon: Heart, desc: 'Brand preference signals and affinity scoring', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { key: 'interests', label: 'Interest Categories', icon: Tag, desc: 'Behavioral interest taxonomy and category mapping', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
]

function statusDot(s: string) {
  if (s === 'active') return 'bg-emerald-400'
  if (s === 'running') return 'bg-blue-400 animate-pulse'
  if (s === 'error') return 'bg-red-400'
  return 'bg-zinc-600'
}

export default function EnrichmentsPage() {
  const [enrichments, setEnrichments] = useState<Enrichment[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/customer-insights/enrichments')
      .then(r => r.json())
      .then(d => { setEnrichments(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  async function runEnrichment(id: string) {
    setRunning(id)
    await fetch(`/api/customer-insights/enrichments/${id}/run`, { method: 'POST' })
    setRunning(null)
    load()
  }

  const getEnrichmentByType = (type: string) => enrichments.find(e => e.enrichmentType.toLowerCase().replace(/\s+/g, '') === type.toLowerCase())

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-cyan-400" />
        <h1 className="text-xl font-bold">Enrichments</h1>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROVIDER_CARDS.map(pc => {
          const enrichment = getEnrichmentByType(pc.key)
          return (
            <div key={pc.key} className={cn('border rounded-xl p-6 space-y-4', pc.bg)}>
              <div className="flex items-start gap-3">
                <pc.icon className={cn('w-6 h-6 flex-shrink-0 mt-0.5', pc.color)} />
                <div>
                  <div className="text-sm font-bold text-zinc-100">{pc.label}</div>
                  <div className="text-xs text-zinc-400 mt-1">{pc.desc}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-700/50 space-y-2">
                {enrichment ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', statusDot(enrichment.status))} />
                        <span className="text-xs text-zinc-300 capitalize">{enrichment.status}</span>
                      </div>
                      <span className="text-xs text-zinc-400">{enrichment.provider}</span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Profiles enriched: <span className="text-zinc-200">{enrichment.profilesEnriched.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Last run: <span className="text-zinc-200">{enrichment.lastRunAt ? new Date(enrichment.lastRunAt).toLocaleString() : 'Never'}</span>
                    </div>
                    <button
                      onClick={() => runEnrichment(enrichment.id)}
                      disabled={running === enrichment.id || enrichment.status === 'running'}
                      className={cn('w-full flex items-center justify-center gap-2 text-sm py-2 rounded-lg mt-2 transition-colors bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50', pc.color)}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {running === enrichment.id ? 'Starting...' : enrichment.status === 'running' ? 'Running...' : 'Run Enrichment'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <div className="w-2 h-2 rounded-full bg-zinc-600" />
                      <span className="text-xs text-zinc-500">Not configured</span>
                    </div>
                    <p className="text-xs text-zinc-500">No enrichment record found for this provider</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* All Enrichments Table */}
      {!loading && enrichments.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300">All Enrichments</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Provider</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Profiles Enriched</th>
                <th className="text-right text-zinc-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrichments.map(e => (
                <tr key={e.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-100">{e.enrichmentName}</td>
                  <td className="px-4 py-3 text-zinc-400">{e.provider}</td>
                  <td className="px-4 py-3"><span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded">{e.enrichmentType}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', statusDot(e.status))} />
                      <span className="text-xs text-zinc-300 capitalize">{e.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-300">{e.profilesEnriched.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => runEnrichment(e.id)} disabled={running === e.id} className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 flex items-center gap-1 ml-auto transition-colors">
                      <Play className="w-3.5 h-3.5" /> Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
