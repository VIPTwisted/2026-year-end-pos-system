'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type AnalyticsData = {
  total: number
  abandoned: number
  abandonmentRate: number
  csatAvg: number | null
  avgWaitSeconds: number
  avgHandleSeconds: number
  avgHandleFormatted: string
  channelBreakdown: { channelId: string; channelName: string; channelType: string; count: number }[]
  sentimentBreakdown: { positive: number; neutral: number; negative: number }
  hourlyDistribution: number[]
  dailyTrend: { date: string; count: number }[]
  agentPerformance: { agentName: string | null; conversations: number; avgHandleTime: number; avgHandleTimeFormatted: string; csatAvg: number | null }[]
  topWrapUpCodes: { code: string; count: number; pct: number }[]
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

const CHANNEL_COLORS: Record<string, string> = {
  voice: '#3b82f6',
  live_chat: '#10b981',
  email: '#f59e0b',
  whatsapp: '#22c55e',
  facebook: '#6366f1',
  sms: '#a855f7',
  custom: '#71717a',
}

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    setLoading(true)
    fetch(`/api/contact-center/analytics?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to])

  if (loading) return (
    <div className="p-6 min-h-[100dvh] bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="text-zinc-500">Loading analytics...</div>
    </div>
  )

  if (!data) return (
    <div className="p-6 min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="text-red-400">Failed to load analytics</div>
    </div>
  )

  const sentTotal = data.sentimentBreakdown.positive + data.sentimentBreakdown.neutral + data.sentimentBreakdown.negative || 1
  const maxHourly = Math.max(...data.hourlyDistribution, 1)
  const maxDaily = Math.max(...data.dailyTrend.map(d => d.count), 1)
  const totalCh = data.channelBreakdown.reduce((a, b) => a + b.count, 0) || 1

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-zinc-100">Contact Center Analytics</h1>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            <label className="text-xs text-zinc-500">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs text-zinc-500">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Conversations', value: data.total.toLocaleString(), color: 'text-zinc-100' },
          { label: 'CSAT Average', value: data.csatAvg ? `${data.csatAvg}/5` : '—', color: 'text-yellow-400' },
          { label: 'Abandonment Rate', value: `${data.abandonmentRate}%`, color: data.abandonmentRate > 10 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Avg Handle Time', value: data.avgHandleFormatted, color: 'text-blue-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className={cn('text-2xl font-bold tabular-nums', kpi.color)}>{kpi.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Channel Breakdown</h2>
          {data.channelBreakdown.length === 0 ? (
            <p className="text-zinc-600 text-sm">No data</p>
          ) : (
            <div className="space-y-3">
              {data.channelBreakdown.map(ch => (
                <div key={ch.channelId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">{ch.channelName} <span className="text-zinc-600">({ch.channelType})</span></span>
                    <span className="text-zinc-500 tabular-nums">{ch.count} ({Math.round((ch.count / totalCh) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.round((ch.count / totalCh) * 100)}%`, backgroundColor: CHANNEL_COLORS[ch.channelType] ?? '#71717a' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sentiment */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Sentiment Analysis</h2>
          <div className="space-y-3">
            {[
              { label: 'Positive', count: data.sentimentBreakdown.positive, color: 'bg-emerald-500' },
              { label: 'Neutral', count: data.sentimentBreakdown.neutral, color: 'bg-zinc-500' },
              { label: 'Negative', count: data.sentimentBreakdown.negative, color: 'bg-red-500' },
            ].map(s => {
              const pct = Math.round((s.count / sentTotal) * 100)
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">{s.label}</span>
                    <span className="text-zinc-500 tabular-nums">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', s.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Hourly Heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Hourly Volume Distribution</h2>
        <div className="grid grid-cols-12 gap-1">
          {data.hourlyDistribution.map((count, h) => {
            const intensity = Math.round((count / maxHourly) * 100)
            return (
              <div key={h} className="flex flex-col items-center gap-1">
                <div
                  className={cn('w-full rounded transition-all', count > 0 ? 'bg-blue-500' : 'bg-zinc-800')}
                  style={{ height: `${Math.max(8, intensity)}px`, opacity: count > 0 ? 0.3 + intensity / 150 : 1 }}
                  title={`${h}:00 — ${count} conversations`}
                />
                <span className="text-[9px] text-zinc-600 tabular-nums">{h}</span>
              </div>
            )
          })}
        </div>
        <div className="text-[10px] text-zinc-600 mt-1">Hour of day (0–23)</div>
      </div>

      {/* Daily Trend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Daily Trend</h2>
        <div className="flex items-end gap-1 h-20">
          {data.dailyTrend.map(d => {
            const h = maxDaily > 0 ? Math.max(4, Math.round((d.count / maxDaily) * 72)) : 4
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative">
                  <div
                    className="w-full bg-blue-500/60 hover:bg-blue-500 rounded-t transition-colors cursor-default"
                    style={{ height: `${h}px`, minWidth: '8px' }}
                    title={`${d.date}: ${d.count}`}
                  />
                </div>
                <span className="text-[8px] text-zinc-700 group-hover:text-zinc-500 transition-colors">
                  {d.date.slice(5)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300">Agent Performance</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Agent</th>
              <th className="px-4 py-3 text-right">Conversations</th>
              <th className="px-4 py-3 text-right">Avg Handle Time</th>
              <th className="px-4 py-3 text-right">CSAT Avg</th>
            </tr>
          </thead>
          <tbody>
            {data.agentPerformance.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No agent data</td></tr>
            )}
            {data.agentPerformance.sort((a, b) => b.conversations - a.conversations).map((a, i) => (
              <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-300 font-medium">{a.agentName ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400 tabular-nums text-right">{a.conversations}</td>
                <td className="px-4 py-3 text-zinc-400 tabular-nums text-right">{a.avgHandleTimeFormatted}</td>
                <td className="px-4 py-3 text-right">
                  {a.csatAvg ? <span className="text-yellow-400 tabular-nums">{a.csatAvg}/5</span> : <span className="text-zinc-600">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Wrap-Up Codes */}
      {data.topWrapUpCodes.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Top Wrap-Up Codes</h2>
          <div className="space-y-2">
            {data.topWrapUpCodes.map(w => (
              <div key={w.code}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-mono text-zinc-400">{w.code}</span>
                  <span className="text-zinc-500 tabular-nums">{w.count} ({w.pct}%)</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500/60 rounded-full" style={{ width: `${w.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
