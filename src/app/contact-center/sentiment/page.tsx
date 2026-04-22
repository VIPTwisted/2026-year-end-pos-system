'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SentimentRecord = {
  id: string
  conversationId?: string | null
  channel: string
  sentiment: string
  sentimentScore: number
  keywords?: string | null
  analyzedAt: string
  agentId?: string | null
  customerId?: string | null
}

function getSentimentLabel(score: number): string {
  if (score >= 60) return 'Very Positive'
  if (score >= 20) return 'Positive'
  if (score >= -20) return 'Neutral'
  if (score >= -60) return 'Negative'
  return 'Very Negative'
}

function getSentimentColor(score: number): string {
  if (score >= 60) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  if (score >= 20) return 'bg-green-500/20 text-green-400 border border-green-500/30'
  if (score >= -20) return 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
  if (score >= -60) return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
  return 'bg-red-500/20 text-red-400 border border-red-500/30'
}

function ScoreBar({ score }: { score: number }) {
  const pct = ((score + 100) / 200) * 100
  const color = score >= 20 ? 'bg-emerald-500' : score >= -20 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-300">{score > 0 ? '+' : ''}{score}</span>
    </div>
  )
}

export default function SentimentPage() {
  const [records, setRecords] = useState<SentimentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [minScore, setMinScore] = useState(-100)
  const [maxScore, setMaxScore] = useState(100)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [agentFilter, setAgentFilter] = useState('')

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (minScore !== -100) params.set('minScore', String(minScore))
    if (maxScore !== 100) params.set('maxScore', String(maxScore))
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    if (agentFilter) params.set('agentId', agentFilter)
    fetch(`/api/contact-center/sentiment?${params}`)
      .then(r => r.json())
      .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/contact-center" className="hover:text-white">Contact Center</Link>
          <span>/</span>
          <span className="text-white font-medium">Sentiment Analysis</span>
        </div>
        <div className="text-xs text-slate-500">{records.length} interaction{records.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Filter Pane */}
      <div className="bg-[#16213e]/60 border-b border-slate-700/30 px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Score Min</label>
          <input
            type="number"
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            min={-100} max={100}
            className="bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-sm text-white w-20 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Score Max</label>
          <input
            type="number"
            value={maxScore}
            onChange={e => setMaxScore(Number(e.target.value))}
            min={-100} max={100}
            className="bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-sm text-white w-20 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">To</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Agent ID</label>
          <input
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className="bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1.5 text-sm text-white w-36 focus:outline-none focus:border-blue-500"
            placeholder="Agent ID..."
          />
        </div>
        <button
          onClick={load}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
        >
          Apply Filter
        </button>
      </div>

      {/* Summary Cards */}
      <div className="px-6 pt-4 grid grid-cols-5 gap-4">
        {[
          { label: 'Very Positive', color: 'text-emerald-400', min: 60 },
          { label: 'Positive', color: 'text-green-400', min: 20, max: 59 },
          { label: 'Neutral', color: 'text-slate-400', min: -20, max: 19 },
          { label: 'Negative', color: 'text-orange-400', min: -60, max: -21 },
          { label: 'Very Negative', color: 'text-red-400', max: -61 },
        ].map(cat => {
          const count = records.filter(r => {
            const s = r.sentimentScore
            if (cat.min !== undefined && cat.max !== undefined) return s >= cat.min && s <= cat.max
            if (cat.min !== undefined) return s >= cat.min
            if (cat.max !== undefined) return s <= cat.max
            return false
          }).length
          return (
            <div key={cat.label} className="bg-[#16213e] rounded-lg border border-slate-700/50 p-3 text-center">
              <div className={`text-xl font-bold ${cat.color}`}>{count}</div>
              <div className="text-xs text-slate-400 mt-1">{cat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading sentiment data...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Interaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Sentiment Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Key Topics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">No sentiment data found.</td>
                  </tr>
                ) : records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-700/20">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {(r.conversationId ?? r.id).slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{r.customerId ? r.customerId.slice(0, 8) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded capitalize">{r.channel}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(r.analyzedAt).toLocaleString()}</td>
                    <td className="px-4 py-3"><ScoreBar score={r.sentimentScore} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSentimentColor(r.sentimentScore)}`}>
                        {getSentimentLabel(r.sentimentScore)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">
                      {r.keywords ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
