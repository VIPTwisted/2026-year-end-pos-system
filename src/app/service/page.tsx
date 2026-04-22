'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Headphones, AlertCircle, Clock, Star, MessageSquare,
  TrendingUp, Phone, Mail, MessageCircle, ShoppingBag,
  Users, ChevronRight,
} from 'lucide-react'

type Metrics = {
  openCases: number
  breachedSla: number
  avgResolutionHours: number
  avgSatisfactionRating: number
  casesToday: number
  casesByStatus: Record<string, number>
  casesByPriority: Record<string, number>
  casesByChannel: Record<string, number>
  queueWorkload: { id: string; name: string; caseCount: number; isActive: boolean }[]
}

type RecentCase = {
  id: string
  caseNumber: string
  subject: string
  customerName: string | null
  priority: string
  status: string
  slaBreached: boolean
  createdAt: string
  queue: { name: string } | null
}

const STATUS_PIPELINE = ['open', 'in_progress', 'pending_customer', 'escalated', 'resolved', 'closed']
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', pending_customer: 'Pending',
  escalated: 'Escalated', resolved: 'Resolved', closed: 'Closed',
}
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500', in_progress: 'bg-yellow-500', pending_customer: 'bg-orange-400',
  escalated: 'bg-red-500', resolved: 'bg-green-500', closed: 'bg-zinc-500',
}
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-zinc-700 text-zinc-300', medium: 'bg-blue-500/20 text-blue-300',
  high: 'bg-orange-500/20 text-orange-300', critical: 'bg-red-500/20 text-red-400',
}
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  phone: <Phone className="w-3 h-3" />, email: <Mail className="w-3 h-3" />,
  chat: <MessageCircle className="w-3 h-3" />, in_store: <ShoppingBag className="w-3 h-3" />,
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star
          key={s}
          className={cn('w-4 h-4', s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600')}
        />
      ))}
    </div>
  )
}

export default function ServiceDashboard() {
  const [metrics, setMetrics]         = useState<Metrics | null>(null)
  const [recentCases, setRecentCases] = useState<RecentCase[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/service/metrics').then((r) => r.json()),
      fetch('/api/service/cases?status=open').then((r) => r.json()),
    ]).then(([m, cases]) => {
      setMetrics(m)
      setRecentCases(cases.slice(0, 8))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 animate-pulse">Loading contact center...</div>
      </div>
    )
  }

  const m = metrics

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Headphones className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100">Contact Center</h1>
              <p className="text-xs text-zinc-500">Customer Service Dashboard</p>
            </div>
          </div>
          <Link
            href="/service/cases"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            View All Cases
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* SLA Breach Alert */}
        {m && m.breachedSla > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="text-red-300 font-medium">SLA Breach Alert: </span>
              <span className="text-red-400">{m.breachedSla} case{m.breachedSla !== 1 ? 's have' : ' has'} breached SLA policy.</span>
            </div>
            <Link href="/service/cases?priority=critical" className="ml-auto text-red-400 hover:text-red-300 text-sm font-medium whitespace-nowrap">
              View →
            </Link>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wide">Open Cases</span>
            </div>
            <div className="text-3xl font-bold text-zinc-100">{m?.openCases ?? 0}</div>
          </div>

          <div className={cn(
            'bg-zinc-900 border rounded-xl p-4',
            m && m.breachedSla > 0 ? 'border-red-500/50' : 'border-zinc-800'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className={cn('w-4 h-4', m && m.breachedSla > 0 ? 'text-red-400' : 'text-zinc-500')} />
              <span className="text-xs text-zinc-400 uppercase tracking-wide">SLA Breached</span>
            </div>
            <div className={cn('text-3xl font-bold', m && m.breachedSla > 0 ? 'text-red-400' : 'text-zinc-100')}>
              {m?.breachedSla ?? 0}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wide">Avg Resolution</span>
            </div>
            <div className="text-3xl font-bold text-zinc-100">{m?.avgResolutionHours ?? 0}<span className="text-sm text-zinc-500 font-normal ml-1">hrs</span></div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wide">CSAT Score</span>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-zinc-100">{m?.avgSatisfactionRating ?? '—'}</div>
              {m && m.avgSatisfactionRating > 0 && <StarRating rating={m.avgSatisfactionRating} />}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wide">Cases Today</span>
            </div>
            <div className="text-3xl font-bold text-zinc-100">{m?.casesToday ?? 0}</div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-zinc-300 mb-4">Case Pipeline</h2>
          <div className="flex gap-2">
            {STATUS_PIPELINE.map((status) => {
              const count = m?.casesByStatus?.[status] ?? 0
              return (
                <Link
                  key={status}
                  href={`/service/cases?status=${status}`}
                  className="flex-1 group"
                >
                  <div className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-3 text-center transition-colors">
                    <div className={cn('w-2 h-2 rounded-full mx-auto mb-2', STATUS_COLORS[status])} />
                    <div className="text-xl font-bold text-zinc-100">{count}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 truncate">{STATUS_LABELS[status]}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Two-column: Recent Cases + Queue Workload */}
        <div className="grid grid-cols-5 gap-6">
          {/* Recent Cases */}
          <div className="col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Recent Open Cases</h2>
              <Link href="/service/cases" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentCases.length === 0 ? (
                <div className="px-4 py-8 text-center text-zinc-500 text-sm">No open cases</div>
              ) : recentCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/service/cases/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-mono">{c.caseNumber.slice(-8)}</span>
                      {c.slaBreached && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">SLA!</span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-200 truncate">{c.subject}</div>
                    <div className="text-xs text-zinc-500">{c.customerName ?? 'Unknown'} {c.queue ? `· ${c.queue.name}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-xs px-2 py-0.5 rounded font-medium', PRIORITY_COLORS[c.priority] ?? 'bg-zinc-700 text-zinc-400')}>
                      {c.priority}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Queue Workload */}
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Queue Workload</h2>
              <Link href="/service/queues" className="text-xs text-indigo-400 hover:text-indigo-300">Manage</Link>
            </div>
            <div className="p-4 space-y-4">
              {!m?.queueWorkload?.length ? (
                <div className="text-center text-zinc-500 text-sm py-6">No queues configured</div>
              ) : (() => {
                const maxCount = Math.max(...m.queueWorkload.map((q) => q.caseCount), 1)
                return m.queueWorkload.map((q) => (
                  <div key={q.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-300">{q.name}</span>
                        {!q.isActive && <span className="text-xs text-zinc-600">(inactive)</span>}
                      </div>
                      <span className="text-sm font-medium text-zinc-200">{q.caseCount}</span>
                    </div>
                    {/* Pure CSS bar chart */}
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${(q.caseCount / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              })()}
            </div>

            {/* Channel breakdown */}
            {m?.casesByChannel && Object.keys(m.casesByChannel).length > 0 && (
              <div className="px-4 pb-4 border-t border-zinc-800 pt-3">
                <div className="text-xs text-zinc-500 mb-2">Cases by Channel</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(m.casesByChannel).map(([ch, cnt]) => (
                    <div key={ch} className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                      {CHANNEL_ICONS[ch] ?? <Users className="w-3 h-3" />}
                      <span>{ch}: {cnt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
