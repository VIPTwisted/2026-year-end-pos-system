'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type HourlyRow = {
  hour: number; calls: number; handled: number; abandoned: number
  avgWait: number; avgHandle: number; csat: number
}
type Analytics = {
  kpis: {
    total: number; handled: number; abandoned: number; avgHandleTime: number
    csatScore: number; fcrPct: number; abandonedRate: number
  }
  hourly: HourlyRow[]
}

function fmtSec(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function CCAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10))
  const [channelFilter, setChannelFilter] = useState('all')
  const [queueFilter, setQueueFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/contact-center/analytics?date=${dateFilter}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [dateFilter])

  const kpis = data?.kpis
  const hourly = data?.hourly ?? []

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/contact-center" className="hover:text-white">Contact Center</Link>
          <span>/</span>
          <span className="text-white font-medium">Analytics</span>
        </div>
      </div>

      {/* Filter Pane */}
      <div className="bg-[#16213e]/60 border-b border-slate-700/30 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Channel</label>
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Channels</option>
            <option value="voice">Voice</option>
            <option value="chat">Chat</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Queue</label>
          <select
            value={queueFilter}
            onChange={e => setQueueFilter(e.target.value)}
            className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Queues</option>
          </select>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading analytics...</div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Total Calls Today', value: kpis?.total ?? 0, color: 'text-white' },
                { label: 'Avg Handle Time', value: fmtSec(kpis?.avgHandleTime ?? 0), color: 'text-white' },
                { label: 'First Call Resolution', value: `${kpis?.fcrPct ?? 0}%`, color: 'text-emerald-400' },
                { label: 'CSAT Score', value: kpis?.csatScore ?? 0, color: 'text-yellow-400' },
                { label: 'Abandoned Rate', value: `${kpis?.abandonedRate ?? 0}%`, color: 'text-red-400' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4 text-center">
                  <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4 text-center">
                <div className="text-xl font-bold text-emerald-400">{kpis?.handled ?? 0}</div>
                <div className="text-xs text-slate-400 mt-1">Calls Handled</div>
              </div>
              <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4 text-center">
                <div className="text-xl font-bold text-red-400">{kpis?.abandoned ?? 0}</div>
                <div className="text-xs text-slate-400 mt-1">Abandoned</div>
              </div>
              <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4 text-center">
                <div className="text-xl font-bold text-blue-400">
                  {kpis?.total && kpis.total > 0 ? `${Math.round((kpis.handled / kpis.total) * 100)}%` : '—'}
                </div>
                <div className="text-xs text-slate-400 mt-1">Resolution Rate</div>
              </div>
            </div>

            {/* Hourly Table */}
            <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
              <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <h3 className="font-semibold text-sm text-white">Hourly Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      {['Hour', 'Calls', 'Handled', 'Abandoned', 'Avg Wait', 'Avg Handle', 'CSAT'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {hourly.filter(h => h.calls > 0).map(row => (
                      <tr key={row.hour} className="hover:bg-slate-700/20">
                        <td className="px-4 py-2 text-slate-300 text-xs font-mono">
                          {String(row.hour).padStart(2, '0')}:00
                        </td>
                        <td className="px-4 py-2 text-white">{row.calls}</td>
                        <td className="px-4 py-2 text-emerald-400">{row.handled}</td>
                        <td className="px-4 py-2 text-red-400">{row.abandoned}</td>
                        <td className="px-4 py-2 text-slate-300">{fmtSec(row.avgWait)}</td>
                        <td className="px-4 py-2 text-slate-300">{fmtSec(row.avgHandle)}</td>
                        <td className="px-4 py-2 text-yellow-400">{row.csat > 0 ? row.csat.toFixed(1) : '—'}</td>
                      </tr>
                    ))}
                    {hourly.filter(h => h.calls > 0).length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">No call data for selected date.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
