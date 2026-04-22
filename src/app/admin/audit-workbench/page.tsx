'use client'
import { useEffect, useState } from 'react'
import { Eye, Download, Bell, BookmarkPlus, Search, Shield, Trash2, RefreshCw } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  module: string
  recordType: string
  recordId: string
  oldValue: string | null
  newValue: string | null
  ipAddress: string
}

interface Kpis {
  totalToday: number
  failedLogins: number
  deletions: number
  exports: number
}

export const dynamic = 'force-dynamic'

const ACTION_STYLES: Record<string, string> = {
  Created:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Updated:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Deleted:  'bg-red-500/10 text-red-400 border-red-500/20',
  Viewed:   'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  Exported: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  Approved: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  Rejected: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  Login:    'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  Logout:   'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

const MODULES = ['All Modules', 'Authentication', 'Sales', 'Inventory', 'Customers', 'Finance', 'Purchasing', 'Administration', 'HR']
const ACTION_TYPES = ['All Actions', 'Created', 'Updated', 'Deleted', 'Viewed', 'Exported', 'Approved', 'Rejected', 'Login', 'Logout']

export default function AuditWorkbenchPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [kpis, setKpis] = useState<Kpis>({ totalToday: 0, failedLogins: 0, deletions: 0, exports: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterModule, setFilterModule] = useState('All Modules')
  const [filterAction, setFilterAction] = useState('All Actions')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  function loadData() {
    const params = new URLSearchParams()
    if (filterModule !== 'All Modules') params.set('module', filterModule)
    if (filterAction !== 'All Actions') params.set('action', filterAction)
    if (search) params.set('search', search)
    setLoading(true)
    fetch(`/api/admin/audit-workbench?${params}`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs); setKpis(d.kpis); setLoading(false) })
  }

  useEffect(() => { loadData() }, [filterModule, filterAction])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    loadData()
  }

  function formatVal(v: string | null) {
    if (!v) return <span className="text-zinc-700">—</span>
    try {
      const parsed = JSON.parse(v)
      return <span className="font-mono text-[10px] text-zinc-400">{JSON.stringify(parsed)}</span>
    } catch {
      return <span className="text-zinc-400 text-[10px]">{v}</span>
    }
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
      <TopBar
        title="Audit Workbench"
        breadcrumb={[{ label: 'Admin', href: '/admin/users' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Download className="w-3 h-3" /> Export Audit Log
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <RefreshCw className="w-3 h-3" /> Schedule Report
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Bell className="w-3 h-3" /> Set Alert
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <BookmarkPlus className="w-3 h-3" /> Save View
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Events Today', value: kpis.totalToday, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Failed Logins', value: kpis.failedLogins, icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', highlight: kpis.failedLogins > 0 },
            { label: 'Deletions', value: kpis.deletions, icon: Trash2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Exports', value: kpis.exports, icon: Download, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map(k => (
            <div key={k.label}
              className={cn('bg-[#16213e] border rounded-xl p-4', k.highlight ? 'border-red-500/30' : 'border-zinc-800/50')}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <span className="text-xs text-zinc-500">{k.label}</span>
              </div>
              <div className={cn('text-3xl font-bold', k.highlight ? 'text-red-400' : 'text-zinc-100')}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
            <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-300 min-w-[140px]">
              {MODULES.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-300 min-w-[130px]">
              {ACTION_TYPES.map(a => <option key={a}>{a}</option>)}
            </select>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input type="text" placeholder="Search user, record ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300 placeholder-zinc-600"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
              Search
            </button>
          </form>
        </div>

        {/* Read-only audit log table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Audit Log</span>
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">READ ONLY</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">User</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Action</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Module</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Record Type</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Record ID</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Old Value</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">New Value</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest whitespace-nowrap">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={9} className="py-16 text-center text-zinc-600">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={9} className="py-16 text-center text-zinc-600">No audit entries match filters</td></tr>
                ) : logs.map(entry => (
                  <>
                    <tr key={entry.id}
                      onClick={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
                      className="hover:bg-zinc-900/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-mono text-zinc-500 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 max-w-[140px] truncate">{entry.user}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', ACTION_STYLES[entry.action] ?? ACTION_STYLES.Viewed)}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{entry.module}</td>
                      <td className="px-4 py-3 text-zinc-500">{entry.recordType}</td>
                      <td className="px-4 py-3 font-mono text-zinc-400">{entry.recordId}</td>
                      <td className="px-4 py-3 max-w-[120px] truncate">{formatVal(entry.oldValue)}</td>
                      <td className="px-4 py-3 max-w-[120px] truncate">{formatVal(entry.newValue)}</td>
                      <td className="px-4 py-3 font-mono text-zinc-600 whitespace-nowrap">{entry.ipAddress}</td>
                    </tr>
                    {expandedRow === entry.id && (
                      <tr key={`${entry.id}-exp`} className="bg-zinc-900/40">
                        <td colSpan={9} className="px-6 py-3">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-zinc-600 mb-1 uppercase tracking-widest text-[10px]">Old Value</p>
                              <pre className="text-zinc-400 bg-zinc-950 rounded p-2 overflow-x-auto text-[11px]">
                                {entry.oldValue ? JSON.stringify(JSON.parse(entry.oldValue), null, 2) : '—'}
                              </pre>
                            </div>
                            <div>
                              <p className="text-zinc-600 mb-1 uppercase tracking-widest text-[10px]">New Value</p>
                              <pre className="text-zinc-400 bg-zinc-950 rounded p-2 overflow-x-auto text-[11px]">
                                {entry.newValue ? JSON.stringify(JSON.parse(entry.newValue), null, 2) : '—'}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
