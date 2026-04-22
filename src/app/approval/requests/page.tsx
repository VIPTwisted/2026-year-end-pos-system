'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { CheckCircle2, XCircle, Clock, ChevronRight, Filter, RefreshCw, UserCheck } from 'lucide-react'

interface ApprovalRequest {
  id: string
  workflowId: string
  entityType: string
  entityRef: string
  requestedBy: string
  status: string
  currentStep: number
  totalSteps: number
  notes: string | null
  createdAt: string
  workflow: { name: string; entityType: string }
  actions: { id: string; action: string; actorName: string; actorRole: string; comment: string | null; createdAt: string }[]
}

const ENTITY_LABELS: Record<string, string> = {
  PURCHASE_ORDER: 'Purchase Order',
  VENDOR_INVOICE: 'Vendor Invoice',
  SALES_ORDER: 'Sales Order',
  JOURNAL_ENTRY: 'Journal Entry',
  BUDGET: 'Budget',
  CUSTOMER: 'Customer',
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    cancelled: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
      {status}
    </span>
  )
}

export default function ApprovalRequestsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (statusFilter) p.set('status', statusFilter)
    if (typeFilter) p.set('entityType', typeFilter)
    fetch(`/api/approvals?${p}`)
      .then(r => r.json())
      .then((d: ApprovalRequest[] | { error: string }) => setRequests(Array.isArray(d) ? d : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [statusFilter, typeFilter])

  useEffect(() => { load() }, [load])

  const approve = async (id: string) => {
    const actor = prompt('Your name:')
    if (!actor) return
    await fetch(`/api/approvals/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', actorName: actor, actorRole: 'manager' }),
    })
    load()
  }

  const reject = async (id: string) => {
    const actor = prompt('Your name:')
    if (!actor) return
    const comment = prompt('Reason (optional):') ?? undefined
    await fetch(`/api/approvals/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', actorName: actor, actorRole: 'manager', comment }),
    })
    load()
  }

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <>
      <TopBar title="Approval Requests" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Operations &rsaquo; Approvals</p>
              <h2 className="text-xl font-bold text-zinc-100">Approval Requests</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Review and act on pending approval requests</p>
            </div>
            <button onClick={load} className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-400' },
              { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
                <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
                <div className={`flex items-center gap-1 text-xs text-zinc-500 mt-1`}>
                  <Icon className={`w-3 h-3 ${color}`} />requests
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              {['', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-7 px-3 rounded text-[11px] font-medium capitalize transition-colors border ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                  }`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="h-7 px-2 rounded text-[11px] bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Types</option>
              {Object.entries(ENTITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
              <UserCheck className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No approval requests found.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Request Type', 'Document No.', 'Requester', 'Sender / Approver', 'Status', 'Step', 'Date', 'Actions'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${h === 'Actions' ? 'text-right' : h === 'Step' ? 'text-center' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {requests.map(r => (
                      <tr key={r.id} className="hover:bg-zinc-800/20 transition-colors group">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {ENTITY_LABELS[r.entityType] ?? r.entityType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px] font-semibold text-zinc-100">{r.entityRef}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{r.requestedBy}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-500">
                          {r.actions.length > 0 && r.actions[r.actions.length - 1].actorName
                            ? r.actions[r.actions.length - 1].actorName
                            : '—'}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3 text-center text-[12px] text-zinc-500 tabular-nums">
                          {r.currentStep} / {r.totalSteps}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-500 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => approve(r.id)} className="h-7 px-2.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                                Approve
                              </button>
                              <button onClick={() => reject(r.id)} className="h-7 px-2.5 rounded text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                                Reject
                              </button>
                            </div>
                          ) : (
                            <a href={`/approvals/${r.id}`} className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-[11px] text-zinc-500 hover:text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800/60 transition-colors">
                              View<ChevronRight className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">
                {requests.length} request{requests.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
