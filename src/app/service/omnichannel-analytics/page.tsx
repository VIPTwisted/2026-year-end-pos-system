'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { MessageCircle, Mail, Phone, Globe, RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Analytics = {
  kpis: {
    openCases: number
    resolvedToday: number
    avgResolutionH: number
    csat: number
    slaBreachRate: string
    backlog: number
  }
  channelVolume: Record<string, number>
  leaderboard: { name: string; cases: number; resolved: number; csat: string }[]
  slaTiers: { tier: string; total: number; withinSla: number; breached: number; compliance: number }[]
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  chat:         <MessageCircle className="w-4 h-4 text-teal-400" />,
  email:        <Mail className="w-4 h-4 text-blue-400" />,
  phone:        <Phone className="w-4 h-4 text-green-400" />,
  self_service: <Globe className="w-4 h-4 text-purple-400" />,
}

const DATE_RANGES = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Quarter']

export default function OmnichannelAnalyticsPage() {
  const [data, setData]         = useState<Analytics | null>(null)
  const [loading, setLoading]   = useState(true)
  const [dateRange, setDateRange] = useState('Last 7 Days')

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch('/api/service/omnichannel-analytics')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const kpiDefs = data
    ? [
        { label: 'Open Cases',          value: data.kpis.openCases,        color: 'text-blue-400' },
        { label: 'Resolved Today',      value: data.kpis.resolvedToday,    color: 'text-green-400' },
        { label: 'Avg Resolution Time', value: `${data.kpis.avgResolutionH}h`, color: 'text-zinc-100' },
        { label: 'CSAT',                value: `${data.kpis.csat}%`,       color: 'text-teal-400' },
        { label: 'SLA Breach Rate',     value: `${data.kpis.slaBreachRate}%`, color: 'text-red-400' },
        { label: 'Backlog',             value: data.kpis.backlog,           color: 'text-orange-400' },
      ]
    : []

  const maxChannel = data
    ? Math.max(...Object.values(data.channelVolume), 1)
    : 1

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="Omnichannel Analytics" subtitle="Real-time cross-channel service performance" />

      {/* Date Range + Refresh */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
        {DATE_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              dateRange === r
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {r}
          </button>
        ))}
        <button onClick={fetchData} className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-zinc-700 rounded w-16 mb-3" />
                  <div className="h-6 bg-zinc-800 rounded w-10" />
                </div>
              ))
            : kpiDefs.map((k) => (
              <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
                <div className="text-xs text-zinc-500 mb-2">{k.label}</div>
                <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              </div>
            ))}
        </div>

        {/* Channel Volume */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Channel Volume</h2>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 bg-zinc-800 rounded" />)}
            </div>
          ) : data ? (
            <div className="space-y-3">
              {Object.entries(data.channelVolume).map(([ch, count]) => (
                <div key={ch} className="flex items-center gap-3">
                  <div className="w-24 flex items-center gap-2">
                    {CHANNEL_ICONS[ch] ?? <Globe className="w-4 h-4 text-zinc-500" />}
                    <span className="text-xs text-zinc-400 capitalize">{ch.replace('_', ' ')}</span>
                  </div>
                  <div className="flex-1 bg-zinc-900 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600/60 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((count / maxChannel) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-300 w-8 text-right font-mono">{count}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Agent Leaderboard */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Agent Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
                  <th className="py-2 text-left">Agent</th>
                  <th className="py-2 text-right">Cases</th>
                  <th className="py-2 text-right">Resolved</th>
                  <th className="py-2 text-right">Avg Time</th>
                  <th className="py-2 text-right">CSAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="py-3"><div className="h-3 bg-zinc-800 rounded w-16" /></td>
                        ))}
                      </tr>
                    ))
                  : data?.leaderboard.map((a, i) => (
                    <tr key={a.name} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                          <span className="text-zinc-300">{a.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-zinc-400">{a.cases}</td>
                      <td className="py-3 text-right text-green-400">{a.resolved}</td>
                      <td className="py-3 text-right text-zinc-400">3.8h</td>
                      <td className="py-3 text-right">
                        <span className="text-teal-400 font-medium">{a.csat}%</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">SLA Compliance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
                  <th className="py-2 text-left">SLA Tier</th>
                  <th className="py-2 text-right">Total Cases</th>
                  <th className="py-2 text-right">Within SLA</th>
                  <th className="py-2 text-right">Breached</th>
                  <th className="py-2 text-right">Compliance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="py-3"><div className="h-3 bg-zinc-800 rounded w-16" /></td>
                        ))}
                      </tr>
                    ))
                  : data?.slaTiers.map((t) => (
                    <tr key={t.tier} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 text-zinc-300 font-medium">{t.tier}</td>
                      <td className="py-3 text-right text-zinc-400">{t.total}</td>
                      <td className="py-3 text-right text-green-400">{t.withinSla}</td>
                      <td className="py-3 text-right text-red-400">{t.breached}</td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${t.compliance >= 95 ? 'text-green-400' : t.compliance >= 85 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {t.compliance}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
