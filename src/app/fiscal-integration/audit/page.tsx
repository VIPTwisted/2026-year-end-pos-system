'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Eye, ChevronDown, ChevronRight, Download } from 'lucide-react'

interface AuditEvent {
  id: string
  eventType: string
  userId: string | null
  userName: string | null
  storeId: string | null
  storeName: string | null
  registerId: string | null
  description: string
  beforeValue: string | null
  afterValue: string | null
  ipAddress: string | null
  sessionId: string | null
  riskLevel: string
  createdAt: string
}

const EVENT_TYPES = ['all', 'transaction', 'void', 'discount', 'price-override', 'login', 'logout', 'shift-open', 'shift-close', 'cash-drawer', 'refund', 'exchange']
const RISK_LEVELS = ['all', 'low', 'medium', 'high', 'critical']

function RiskBadge({ level }: { level: string }) {
  const cfg: Record<string, string> = {
    low: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    critical: 'bg-red-500/15 text-red-400 border-red-500/20',
  }
  return <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 capitalize ${cfg[level] ?? cfg.low}`}>{level}</span>
}

function EventTypeBadge({ type }: { type: string }) {
  return <span className="text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full px-2 py-0.5">{type}</span>
}

function tryFormatJson(val: string | null): string {
  if (!val) return ''
  try {
    return JSON.stringify(JSON.parse(val), null, 2)
  } catch {
    return val
  }
}

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({ eventType: 'all', riskLevel: 'all', store: '', from: '', to: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.eventType !== 'all') params.set('eventType', filters.eventType)
    if (filters.riskLevel !== 'all') params.set('riskLevel', filters.riskLevel)
    if (filters.store) params.set('storeId', filters.store)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)

    const res = await fetch(`/api/fiscal/audit?${params}`)
    const data = await res.json()
    setEvents(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filters])

  useEffect(() => { load() }, [load])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const eventsToday = events.filter(e => new Date(e.createdAt) >= todayStart).length
  const highRisk = events.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length
  const uniqueUsers = new Set(events.map(e => e.userName).filter(Boolean)).size

  const exportCsv = () => {
    const headers = ['Timestamp', 'Event Type', 'User', 'Store', 'Register', 'Description', 'Risk Level', 'IP Address']
    const rows = events.map(e => [
      new Date(e.createdAt).toISOString(),
      e.eventType,
      e.userName ?? '',
      e.storeName ?? '',
      e.registerId ?? '',
      e.description,
      e.riskLevel,
      e.ipAddress ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <TopBar title="Audit Trail" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Audit Trail</h2>
            <p className="text-xs text-zinc-500">{events.length} events loaded</p>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-zinc-100">{eventsToday}</p>
            <p className="text-xs text-zinc-500 mt-1">Events Today</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className={`text-2xl font-bold ${highRisk > 0 ? 'text-red-400' : 'text-zinc-100'}`}>{highRisk}</p>
            <p className="text-xs text-zinc-500 mt-1">High Risk Events</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-zinc-100">{uniqueUsers}</p>
            <p className="text-xs text-zinc-500 mt-1">Active Users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div>
            <label className="block text-[10px] text-zinc-600 mb-1 uppercase tracking-wide">Event Type</label>
            <select value={filters.eventType} onChange={e => setFilters(p => ({ ...p, eventType: e.target.value }))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-600 mb-1 uppercase tracking-wide">Risk Level</label>
            <select value={filters.riskLevel} onChange={e => setFilters(p => ({ ...p, riskLevel: e.target.value }))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
              {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-600 mb-1 uppercase tracking-wide">From</label>
            <input type="date" value={filters.from} onChange={e => setFilters(p => ({ ...p, from: e.target.value }))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-600 mb-1 uppercase tracking-wide">To</label>
            <input type="date" value={filters.to} onChange={e => setFilters(p => ({ ...p, to: e.target.value }))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({ eventType: 'all', riskLevel: 'all', store: '', from: '', to: '' })}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 transition-colors">
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-zinc-600 text-sm">Loading audit events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No audit events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-600 uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium w-6"></th>
                  <th className="text-left pb-3 font-medium">Timestamp</th>
                  <th className="text-left pb-3 font-medium">Event Type</th>
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Store</th>
                  <th className="text-left pb-3 font-medium">Register</th>
                  <th className="text-left pb-3 font-medium">Description</th>
                  <th className="text-left pb-3 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => {
                  const isExpanded = expanded.has(event.id)
                  const hasDetail = event.beforeValue || event.afterValue
                  return (
                    <>
                      <tr key={event.id} className={`hover:bg-zinc-900/40 border-b border-zinc-800/50 ${event.riskLevel === 'critical' ? 'bg-red-950/10' : event.riskLevel === 'high' ? 'bg-orange-950/10' : ''}`}>
                        <td className="py-3 pr-2">
                          {hasDetail && (
                            <button onClick={() => toggleExpand(event.id)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-zinc-400 font-mono">
                            {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="py-3 pr-4"><EventTypeBadge type={event.eventType} /></td>
                        <td className="py-3 pr-4 text-xs text-zinc-300">{event.userName ?? '—'}</td>
                        <td className="py-3 pr-4 text-xs text-zinc-400">{event.storeName ?? '—'}</td>
                        <td className="py-3 pr-4 text-xs text-zinc-400">{event.registerId ?? '—'}</td>
                        <td className="py-3 pr-4 text-xs text-zinc-300 max-w-xs truncate">{event.description}</td>
                        <td className="py-3"><RiskBadge level={event.riskLevel} /></td>
                      </tr>
                      {isExpanded && hasDetail && (
                        <tr key={event.id + '-detail'} className="bg-zinc-900/60">
                          <td colSpan={8} className="pb-4 px-8">
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div>
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-2">Before</p>
                                <pre className="text-[11px] text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                                  {tryFormatJson(event.beforeValue) || '—'}
                                </pre>
                              </div>
                              <div>
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-2">After</p>
                                <pre className="text-[11px] text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                                  {tryFormatJson(event.afterValue) || '—'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
