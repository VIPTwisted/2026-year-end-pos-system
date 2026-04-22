'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'
import { Plus, GitBranch, ChevronRight, Circle } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Workstream = {
  id: string
  name: string
  channel: string
  capacity: number
  routingMode: string
  sessionTimeout: number
  isActive: boolean
  skillsRequired: string | null
  createdAt: string
}

const CHANNEL_COLORS: Record<string, string> = {
  chat:   'bg-teal-500/20 text-teal-300 border-teal-500/30',
  email:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  voice:  'bg-green-500/20 text-green-300 border-green-500/30',
  social: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const ROUTING_LABELS: Record<string, string> = {
  round_robin:  'Round Robin',
  least_active: 'Least Active',
  skill_match:  'Skill Match',
  priority:     'Priority',
}

export default function WorkstreamsPage() {
  const [workstreams, setWorkstreams] = useState<Workstream[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch('/api/service/routing/workstreams')
      .then((r) => r.json())
      .then((d) => { setWorkstreams(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const total       = workstreams.length
  const activeCount = workstreams.filter((w) => w.isActive).length
  const avgCapacity = total ? (workstreams.reduce((s, w) => s + w.capacity, 0) / total).toFixed(1) : '0.0'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="Workstreams" subtitle="Channel routing and capacity configuration" />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 px-6 py-5">
        {[
          { label: 'Total Workstreams',    value: total },
          { label: 'Active',               value: activeCount },
          { label: 'Avg Capacity',         value: avgCapacity },
        ].map((k) => (
          <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-2">{k.label}</div>
            <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-zinc-300">All Workstreams</span>
        </div>
        <Link
          href="/service/routing/workstreams/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Workstream
        </Link>
      </div>

      {/* Table */}
      <div className="px-6 pb-8">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Channel</th>
                <th className="px-4 py-3 text-left">Routing Mode</th>
                <th className="px-4 py-3 text-right">Capacity</th>
                <th className="px-4 py-3 text-right">Timeout</th>
                <th className="px-4 py-3 text-left">Skills</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                      ))}
                    </tr>
                  ))
                : workstreams.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                      No workstreams yet. <Link href="/service/routing/workstreams/new" className="text-indigo-400 hover:underline">Create one</Link>
                    </td>
                  </tr>
                )
                : workstreams.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-200">{w.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded border font-medium capitalize', CHANNEL_COLORS[w.channel] ?? 'bg-zinc-700 text-zinc-400 border-zinc-600')}>
                        {w.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{ROUTING_LABELS[w.routingMode] ?? w.routingMode}</td>
                    <td className="px-4 py-3 text-right text-zinc-300 font-mono">{w.capacity}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{w.sessionTimeout}m</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{w.skillsRequired ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Circle className={cn('w-2 h-2 fill-current', w.isActive ? 'text-green-400' : 'text-zinc-600')} />
                        <span className={cn('text-xs', w.isActive ? 'text-green-400' : 'text-zinc-500')}>
                          {w.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
