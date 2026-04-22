'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { ChevronUp, ChevronDown, Users, TrendingUp, Clock, DollarSign, Activity } from 'lucide-react'

interface RFMCustomer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  recencyDays: number
  frequency: number
  monetary: number
  rScore: number
  fScore: number
  mScore: number
  rfmScore: number
  segment: string
}

interface RFMResponse {
  customers: RFMCustomer[]
  segments: Record<string, number>
}

type SortKey = 'rfmScore' | 'recencyDays' | 'frequency' | 'monetary' | 'rScore' | 'fScore' | 'mScore'
type SortDir = 'asc' | 'desc'

const SEGMENT_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  Champions: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: TrendingUp,
  },
  'Loyal Customers': {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: Users,
  },
  'Potential Loyalists': {
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: Activity,
  },
  'At Risk': {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: Clock,
  },
  Lost: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: DollarSign,
  },
}

const SCORE_COLOR: Record<number, string> = {
  5: 'bg-emerald-500/20 text-emerald-300',
  4: 'bg-blue-500/20 text-blue-300',
  3: 'bg-zinc-700/60 text-zinc-300',
  2: 'bg-amber-500/20 text-amber-300',
  1: 'bg-red-500/20 text-red-300',
}

export default function RFMPage() {
  const [data, setData] = useState<RFMResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSegment, setActiveSegment] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('rfmScore')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    fetch('/api/reports/rfm')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json() as Promise<RFMResponse>
      })
      .then(d => setData(d))
      .catch(() => setError('Failed to load RFM data'))
      .finally(() => setLoading(false))
  }, [])

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }, [sortKey])

  const filteredAndSorted = useCallback((): RFMCustomer[] => {
    if (!data) return []
    let rows = data.customers
    if (activeSegment) {
      rows = rows.filter(c => c.segment === activeSegment)
    }
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return 0
    })
  }, [data, activeSegment, sortKey, sortDir])

  const totalCustomers = data
    ? Object.values(data.segments).reduce((s, n) => s + n, 0)
    : 0

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="opacity-30"><ChevronUp className="w-3 h-3" /></span>
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-400" />
      : <ChevronDown className="w-3 h-3 text-blue-400" />
  }

  function ScoreBadge({ score }: { score: number }) {
    return (
      <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${SCORE_COLOR[score] ?? SCORE_COLOR[3]}`}>
        {score}
      </span>
    )
  }

  function SegmentBadge({ segment }: { segment: string }) {
    const cfg = SEGMENT_CONFIG[segment]
    if (!cfg) return <span className="text-zinc-400 text-[11px]">{segment}</span>
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
        {segment}
      </span>
    )
  }

  const rows = filteredAndSorted()

  return (
    <>
      <TopBar
        title="Customer RFM Analysis"
        breadcrumb={[{ label: 'Reports', href: '/reports' }]}
      />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Page header */}
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Customer RFM Analysis</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Segment customers by Recency, Frequency, and Monetary value — target the right people with the right campaigns.
            </p>
          </div>

          {/* RFM Explanation */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'R — Recency',
                icon: Clock,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                desc: 'How recently did the customer make a purchase? Customers who bought recently are more likely to buy again.',
              },
              {
                label: 'F — Frequency',
                icon: TrendingUp,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                desc: 'How often does the customer purchase? Frequent buyers are more engaged and have higher brand loyalty.',
              },
              {
                label: 'M — Monetary',
                icon: DollarSign,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                desc: 'How much has the customer spent in total? High spenders drive the most revenue and should be rewarded.',
              },
            ].map(dim => (
              <div key={dim.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${dim.bg} flex items-center justify-center`}>
                    <dim.icon className={`w-3.5 h-3.5 ${dim.color}`} />
                  </div>
                  <span className={`text-[12px] font-semibold ${dim.color}`}>{dim.label}</span>
                </div>
                <p className="text-[12px] text-zinc-400 leading-relaxed">{dim.desc}</p>
              </div>
            ))}
          </div>

          {/* Segment Summary Cards */}
          {loading ? (
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 animate-pulse h-24" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          ) : data && (
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(SEGMENT_CONFIG).map(([seg, cfg]) => {
                const count = data.segments[seg] ?? 0
                const pct = totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0
                const isActive = activeSegment === seg
                const Icon = cfg.icon
                return (
                  <button
                    key={seg}
                    onClick={() => setActiveSegment(isActive ? null : seg)}
                    className={`bg-[#16213e] border rounded-lg p-4 text-left transition-all ${
                      isActive
                        ? `${cfg.border} ring-1 ring-inset ${cfg.border}`
                        : 'border-zinc-800/50 hover:border-zinc-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                      {isActive && (
                        <span className="text-[10px] text-zinc-500">Filtered</span>
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${cfg.color}`}>{count}</div>
                    <div className="text-[11px] font-semibold text-zinc-300 mt-0.5">{seg}</div>
                    <div className="text-[11px] text-zinc-500">{pct}% of customers</div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Customer Table */}
          {data && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">
                    {activeSegment ? `${activeSegment} Customers` : 'All Customers'}
                  </span>
                  <span className="text-[11px] bg-zinc-800/60 text-zinc-400 px-2 py-0.5 rounded">
                    {rows.length} customers
                  </span>
                  {activeSegment && (
                    <button
                      onClick={() => setActiveSegment(null)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-zinc-600 italic">
                  Use this data to target marketing campaigns
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800/60 bg-zinc-900/40">
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</span>
                      </th>
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Email</span>
                      </th>
                      <th className="px-4 py-2.5 text-right cursor-pointer select-none" onClick={() => handleSort('recencyDays')}>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 inline-flex items-center gap-1 justify-end">
                          Recency <SortIcon col="recencyDays" />
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-right cursor-pointer select-none" onClick={() => handleSort('frequency')}>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 inline-flex items-center gap-1 justify-end">
                          Frequency <SortIcon col="frequency" />
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-right cursor-pointer select-none" onClick={() => handleSort('monetary')}>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 inline-flex items-center gap-1 justify-end">
                          Monetary <SortIcon col="monetary" />
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-center cursor-pointer select-none" onClick={() => handleSort('rfmScore')}>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 inline-flex items-center gap-1 justify-center">
                          R/F/M Scores <SortIcon col="rfmScore" />
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Segment</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 text-sm">
                          No customers with orders found
                        </td>
                      </tr>
                    ) : (
                      rows.map((c, i) => (
                        <tr
                          key={c.id}
                          className={`border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors ${
                            i % 2 === 0 ? '' : 'bg-zinc-900/20'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/customers/${c.id}`}
                              className="text-zinc-100 font-medium hover:text-blue-400 transition-colors text-sm"
                            >
                              {c.firstName} {c.lastName}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-zinc-400 text-sm font-mono">
                              {c.email ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-zinc-300 text-sm tabular-nums">
                              {c.recencyDays === 0 ? 'Today' : `${c.recencyDays}d ago`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-zinc-300 text-sm tabular-nums">
                              {c.frequency} {c.frequency === 1 ? 'order' : 'orders'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-zinc-100 text-sm font-semibold tabular-nums">
                              {formatCurrency(c.monetary)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-[10px] text-zinc-600 mr-0.5">R</span>
                              <ScoreBadge score={c.rScore} />
                              <span className="text-[10px] text-zinc-600 mx-0.5">F</span>
                              <ScoreBadge score={c.fScore} />
                              <span className="text-[10px] text-zinc-600 mx-0.5">M</span>
                              <ScoreBadge score={c.mScore} />
                              <span className="text-[10px] text-zinc-600 mx-1.5">→</span>
                              <span className="text-[11px] font-bold text-zinc-200 bg-zinc-800/60 px-1.5 py-0.5 rounded tabular-nums">
                                {c.rfmScore}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <SegmentBadge segment={c.segment} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
