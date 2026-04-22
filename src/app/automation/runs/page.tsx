'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react'

interface WorkflowRun {
  id: string; workflowId: string; workflowName: string | null; trigger: string | null
  status: string; actionsRun: number; errorMessage: string | null; duration: number | null
  createdAt: string; triggerData?: string | null
}
interface Workflow { id: string; name: string }

function StatusBadge({ status }: { status: string }) {
  if (status === 'success') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-500/15 text-emerald-400 font-medium"><CheckCircle className="w-3 h-3" />Success</span>
  if (status === 'failed') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/15 text-red-400 font-medium"><XCircle className="w-3 h-3" />Failed</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-700/40 text-zinc-400 font-medium"><Clock className="w-3 h-3" />Skipped</span>
}

const TRIGGER_LABELS: Record<string, string> = {
  'order-created': 'Order Created', 'order-shipped': 'Order Shipped', 'payment-received': 'Payment Received',
  'inventory-low': 'Inventory Low', 'customer-created': 'Customer Created', 'loyalty-tier-change': 'Loyalty Tier Changed',
  'case-created': 'Case Created', 'case-resolved': 'Case Resolved', 'shift-started': 'Shift Started',
  'shift-ended': 'Shift Ended', 'daily-schedule': 'Daily Schedule', 'weekly-schedule': 'Weekly Schedule',
}

export default function RunHistoryPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [workflowFilter, setWorkflowFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/automation/workflows').then(r => r.json()).then(setWorkflows) }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (workflowFilter) params.set('workflowId', workflowFilter)
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    fetch(`/api/automation/runs?${params}`).then(r => r.json()).then(d => { setRuns(d); setLoading(false) })
  }, [statusFilter, workflowFilter, fromDate, toDate])

  function toggleExpand(id: string) {
    setExpanded(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const successCount = runs.filter(r => r.status === 'success').length
  const failedCount = runs.filter(r => r.status === 'failed').length

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Run History</h1>
        <p className="text-sm text-zinc-400 mt-0.5">All workflow execution logs</p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-zinc-400">{runs.length} total</span>
        <span className="text-emerald-400">{successCount} succeeded</span>
        <span className="text-red-400">{failedCount} failed</span>
        {runs.length > 0 && <span className="text-zinc-500">{Math.round((successCount / runs.length) * 100)}% success rate</span>}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </select>
        <select value={workflowFilter} onChange={e => setWorkflowFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500">
          <option value="">All Workflows</option>
          {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">From</span>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">To</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500" />
        </div>
        {(statusFilter || workflowFilter || fromDate || toDate) && (
          <button onClick={() => { setStatusFilter(''); setWorkflowFilter(''); setFromDate(''); setToDate('') }} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Clear filters</button>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="w-8 px-3 py-3"></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Workflow</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Trigger</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Error</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-600">Loading...</td></tr>
            ) : runs.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-600">No runs match your filters</td></tr>
            ) : runs.map(run => {
              const isExpanded = expanded.has(run.id)
              return (
                <>
                  <tr key={run.id} className={`hover:bg-zinc-800/30 ${run.status === 'failed' ? 'bg-red-500/5' : ''}`}>
                    <td className="px-3 py-3">
                      {run.status === 'failed' && (
                        <button onClick={() => toggleExpand(run.id)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-200">{run.workflowName ?? <span className="text-zinc-600 italic">Deleted</span>}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{run.trigger ? (TRIGGER_LABELS[run.trigger] ?? run.trigger) : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                    <td className="px-4 py-3 text-zinc-400">{run.actionsRun}</td>
                    <td className="px-4 py-3 text-red-400 text-xs max-w-[180px] truncate">{run.status === 'failed' ? (run.errorMessage ?? 'Unknown error') : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{run.duration != null ? `${run.duration}ms` : '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(run.createdAt).toLocaleString()}</td>
                  </tr>
                  {isExpanded && run.status === 'failed' && (
                    <tr key={`${run.id}-exp`} className="bg-red-500/5">
                      <td colSpan={8} className="px-12 py-3">
                        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-red-300 mb-1">Error Details</p>
                          <code className="text-xs text-red-400">{run.errorMessage ?? 'No additional details'}</code>
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
    </div>
  )
}
