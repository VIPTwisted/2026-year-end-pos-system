'use client'
import { useEffect, useState } from 'react'
import { TrendingDown, AlertTriangle, PauseCircle, Shield, Filter } from 'lucide-react'

interface ChurnEvent {
  id: string
  subscriptionId: string
  eventType: string
  previousStatus?: string
  reason?: string
  savedBy?: string
  createdAt: string
}

const EVENT_TYPES = ['all', 'cancelled', 'paused', 'downgraded', 'reactivated', 'expired']

const eventBadge: Record<string, string> = {
  cancelled: 'bg-red-500/20 text-red-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  downgraded: 'bg-orange-500/20 text-orange-400',
  reactivated: 'bg-emerald-500/20 text-emerald-400',
  expired: 'bg-zinc-700 text-zinc-400',
}

export default function ChurnPage() {
  const [events, setEvents] = useState<ChurnEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('eventType', typeFilter)
    fetch(`/api/subscriptions/churn?${params}`).then(r => r.json()).then(d => { setEvents(d); setLoading(false) })
  }

  useEffect(() => { load() }, [typeFilter])

  const now = new Date()
  const thisMonth = events.filter(e => {
    const d = new Date(e.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const cancellationsThisMonth = thisMonth.filter(e => e.eventType === 'cancelled').length
  const pausesThisMonth = thisMonth.filter(e => e.eventType === 'paused').length
  const reactivations = thisMonth.filter(e => e.eventType === 'reactivated').length
  const totalChurnable = cancellationsThisMonth + pausesThisMonth
  const saveRate = totalChurnable > 0 ? Math.round((reactivations / totalChurnable) * 100) : 0

  const reasonMap: Record<string, number> = {}
  events.filter(e => e.eventType === 'cancelled' && e.reason).forEach(e => {
    const r = e.reason!.slice(0, 30)
    reasonMap[r] = (reasonMap[r] ?? 0) + 1
  })
  const reasons = Object.entries(reasonMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxReason = Math.max(...reasons.map(r => r[1]), 1)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><TrendingDown className="w-6 h-6 text-red-400" />Churn Analysis</h1>
        <p className="text-zinc-500 text-sm mt-1">Subscriber churn events, retention insights, and save rate tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Churn Events (Month)', value: thisMonth.length.toString(), icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Cancellation Rate', value: `${events.length > 0 ? Math.round((cancellationsThisMonth / Math.max(events.length, 1)) * 100) : 0}%`, icon: TrendingDown, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Pause Rate', value: `${events.length > 0 ? Math.round((pausesThisMonth / Math.max(events.length, 1)) * 100) : 0}%`, icon: PauseCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Save Rate', value: `${saveRate}%`, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center`}>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-100">{k.value}</div>
              <div className="text-xs text-zinc-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-zinc-500" />
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              {EVENT_TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors capitalize ${typeFilter === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950">
                <tr>
                  {['Sub ID', 'Event', 'Prev Status', 'Reason', 'Saved By', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">Loading…</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">No churn events found</td></tr>
                ) : events.slice(0, 100).map(ev => (
                  <tr key={ev.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{ev.subscriptionId.slice(-8)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${eventBadge[ev.eventType] ?? 'bg-zinc-700 text-zinc-400'}`}>{ev.eventType}</span></td>
                    <td className="px-4 py-3 text-zinc-500 text-xs capitalize">{ev.previousStatus ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-[160px] truncate">{ev.reason ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{ev.savedBy ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(ev.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">Churn by Reason</h2>
            {reasons.length === 0 ? (
              <p className="text-xs text-zinc-600">No cancellation reasons recorded</p>
            ) : (
              <div className="space-y-2.5">
                {reasons.map(([reason, count]) => (
                  <div key={reason}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 truncate max-w-[140px]">{reason}</span>
                      <span className="text-zinc-500 shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-red-500/70 rounded-full" style={{ width: `${(count / maxReason) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-emerald-900/40 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><Shield className="w-4 h-4" />Retention Tips</h2>
            <ul className="space-y-2.5">
              {[
                'Offer pause instead of cancel to prevent hard churn',
                'Proactively reach at-risk subscribers at 60-day mark',
                'Send win-back campaigns 30 days post-cancellation',
                'Offer discount before cancellation completes',
                'Track NPS score at renewal to catch dissatisfaction early',
                'Monitor failed payment retries — often precede churn',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
