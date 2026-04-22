'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Shield, RefreshCw, Search, ChevronLeft, ChevronRight, AlertTriangle, Info, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AuditEvent = {
  id: string
  eventType: string
  userId: string | null
  userName: string | null
  storeId: string | null
  storeName: string | null
  description: string
  beforeValue: string | null
  afterValue: string | null
  ipAddress: string | null
  riskLevel: string
  createdAt: string
}

type PageData = {
  events: AuditEvent[]
  total: number
}

const RISK_STYLES: Record<string, { cls: string; icon: React.ReactNode }> = {
  critical: { cls: 'bg-red-500/15 text-red-400 border-red-500/20', icon: <Lock className="w-3 h-3" /> },
  high: { cls: 'bg-orange-500/15 text-orange-400 border-orange-500/20', icon: <AlertTriangle className="w-3 h-3" /> },
  medium: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: <AlertTriangle className="w-3 h-3" /> },
  low: { cls: 'bg-zinc-700/50 text-zinc-400 border-zinc-700', icon: <Info className="w-3 h-3" /> },
}

const PAGE_SIZE = 50

function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function AuditTrailPage() {
  const [data, setData] = useState<PageData>({ events: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('skip', String(page * PAGE_SIZE))
      params.set('take', String(PAGE_SIZE))
      if (q) params.set('q', q)
      if (riskFilter) params.set('riskLevel', riskFilter)
      if (typeFilter) params.set('eventType', typeFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const res = await fetch(`/api/audit/events?${params.toString()}`)
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, q, riskFilter, typeFilter, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(data.total / PAGE_SIZE)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Audit Trail" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">Immutable Event Log</h2>
            <p className="text-[13px] text-zinc-500">
              {data.total.toLocaleString()} total events · read-only forensic record
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(0) }}
              placeholder="Search description, user, event type..."
              className="w-full bg-[#16213e] border border-zinc-800 text-zinc-100 text-[13px] rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={riskFilter}
            onChange={e => { setRiskFilter(e.target.value); setPage(0) }}
            className="bg-[#16213e] border border-zinc-800 text-zinc-300 text-[12px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(0) }}
            className="bg-[#16213e] border border-zinc-800 text-zinc-300 text-[12px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Event Types</option>
            <option value="login">login</option>
            <option value="logout">logout</option>
            <option value="sale">sale</option>
            <option value="refund">refund</option>
            <option value="void">void</option>
            <option value="price_override">price_override</option>
            <option value="discount_applied">discount_applied</option>
            <option value="cash_drawer">cash_drawer</option>
            <option value="shift_open">shift_open</option>
            <option value="shift_close">shift_close</option>
            <option value="config_change">config_change</option>
            <option value="user_created">user_created</option>
            <option value="permission_change">permission_change</option>
            <option value="fx_revaluation">fx_revaluation</option>
            <option value="journal_posted">journal_posted</option>
            <option value="year_end_close">year_end_close</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(0) }}
            className="bg-[#16213e] border border-zinc-800 text-zinc-300 text-[12px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-zinc-600 text-[12px]">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(0) }}
            className="bg-[#16213e] border border-zinc-800 text-zinc-300 text-[12px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {(q || riskFilter || typeFilter || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300" onClick={() => { setQ(''); setRiskFilter(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); setPage(0) }}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider w-40">Timestamp</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider w-32">Event Type</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider w-32">User</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider w-28">Store</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider w-20">Risk</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider w-28">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <RefreshCw className="w-6 h-6 text-zinc-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data.events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Shield className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-600">No audit events found matching your filters.</p>
                  </td>
                </tr>
              ) : data.events.map(ev => {
                const risk = RISK_STYLES[ev.riskLevel] ?? RISK_STYLES.low
                const isExpanded = expanded === ev.id
                const hasDiff = ev.beforeValue || ev.afterValue
                return (
                  <>
                    <tr
                      key={ev.id}
                      onClick={() => hasDiff && setExpanded(isExpanded ? null : ev.id)}
                      className={`hover:bg-zinc-800/30 transition-colors ${hasDiff ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-zinc-800/20' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-zinc-500 whitespace-nowrap">{formatTs(ev.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-blue-400/80 text-[11px]">{ev.eventType}</span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300 max-w-[300px] truncate">{ev.description}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{ev.userName ?? ev.userId ?? '—'}</td>
                      <td className="px-4 py-2.5 text-zinc-500">{ev.storeName ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium capitalize ${risk.cls}`}>
                          {risk.icon}
                          {ev.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-600">{ev.ipAddress ?? '—'}</td>
                    </tr>
                    {isExpanded && hasDiff && (
                      <tr key={`${ev.id}-diff`} className="bg-zinc-900/60">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            {ev.beforeValue && (
                              <div>
                                <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-1.5">Before</p>
                                <pre className="bg-zinc-900 border border-zinc-800 rounded-md p-3 text-[11px] text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-40">
                                  {(() => { try { return JSON.stringify(JSON.parse(ev.beforeValue), null, 2) } catch { return ev.beforeValue } })()}
                                </pre>
                              </div>
                            )}
                            {ev.afterValue && (
                              <div>
                                <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-1.5">After</p>
                                <pre className="bg-zinc-900 border border-zinc-800 rounded-md p-3 text-[11px] text-emerald-400/80 overflow-x-auto whitespace-pre-wrap max-h-40">
                                  {(() => { try { return JSON.stringify(JSON.parse(ev.afterValue), null, 2) } catch { return ev.afterValue } })()}
                                </pre>
                              </div>
                            )}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-zinc-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, data.total)} of {data.total.toLocaleString()} events
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 text-[12px] text-zinc-400">Page {page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
