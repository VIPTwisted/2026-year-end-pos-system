'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Send, CheckCircle, XCircle, DollarSign, X } from 'lucide-react'
import Link from 'next/link'

type Line = {
  id: string
  category: string
  description: string
  amount: number
  expenseDate: string
  receiptRef: string | null
  notes: string | null
}

type Report = {
  id: string
  reportNo: string
  title: string
  status: string
  totalAmount: number
  approvedBy: string | null
  approvedAt: string | null
  paidAt: string | null
  rejectedReason: string | null
  notes: string | null
  createdAt: string
  employee: { id: string; firstName: string; lastName: string; position: string }
  lines: Line[]
}

const CATEGORY_BADGE: Record<string, string> = {
  meals: 'bg-emerald-500/10 text-emerald-400',
  travel: 'bg-blue-500/10 text-blue-400',
  supplies: 'bg-amber-500/10 text-amber-400',
  entertainment: 'bg-purple-500/10 text-purple-400',
  other: 'bg-zinc-700 text-zinc-400',
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-400',
  submitted: 'bg-blue-500/10 text-blue-400',
  approved: 'bg-emerald-500/10 text-emerald-400',
  rejected: 'bg-red-500/10 text-red-400',
  paid: 'bg-purple-500/10 text-purple-400',
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] ?? 'bg-zinc-700 text-zinc-400'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function CategoryBadge({ cat }: { cat: string }) {
  const cls = CATEGORY_BADGE[cat] ?? 'bg-zinc-700 text-zinc-400'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {cat.charAt(0).toUpperCase() + cat.slice(1)}
    </span>
  )
}

export default function ExpenseReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Modal state
  const [approveModal, setApproveModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [approverName, setApproverName] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionBusy, setActionBusy] = useState(false)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/hr/expenses/${id}`)
      .then(r => r.json())
      .then((data: Report) => { setReport(data); setLoading(false) })
      .catch(() => { notify('Failed to load report', 'err'); setLoading(false) })
  }, [id])

  useEffect(() => { load() }, [load])

  const doAction = async (action: string, extra: Record<string, string> = {}) => {
    setActionBusy(true)
    try {
      const res = await fetch(`/api/hr/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        notify(data.error ?? 'Action failed', 'err')
        return
      }
      const updated = await res.json() as Report
      setReport(updated)
      setApproveModal(false)
      setRejectModal(false)
      setPayModal(false)
      setApproverName('')
      setRejectReason('')
      notify('Updated successfully')
    } catch {
      notify('Network error', 'err')
    } finally {
      setActionBusy(false)
    }
  }

  // Group lines by category for totals
  const categoryTotals = report?.lines.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] ?? 0) + l.amount
    return acc
  }, {}) ?? {}

  if (loading) {
    return (
      <>
        <TopBar title="Expense Report" />
        <main className="flex-1 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <div className="text-zinc-500 text-sm">Loading…</div>
        </main>
      </>
    )
  }

  if (!report) {
    return (
      <>
        <TopBar title="Expense Report" />
        <main className="flex-1 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <div className="text-zinc-500 text-sm">Report not found</div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar title={`Expense Report — ${report.reportNo}`} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-100">Approve Expense Report</h3>
              <button onClick={() => setApproveModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Approving <span className="text-zinc-200 font-medium">{report.reportNo}</span> for{' '}
              <span className="text-zinc-200 font-medium">{formatCurrency(report.totalAmount)}</span>.
            </p>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Manager Name *
            </label>
            <input
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 mb-4"
              value={approverName}
              onChange={e => setApproverName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setApproveModal(false)}
                className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => doAction('approve', { approvedBy: approverName })}
                disabled={!approverName.trim() || actionBusy}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium"
              >
                {actionBusy ? 'Approving…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-100">Reject Expense Report</h3>
              <button onClick={() => setRejectModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Reason for Rejection
            </label>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-500 resize-none h-24 mb-4"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Explain why this report is being rejected…"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal(false)}
                className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => doAction('reject', { rejectedReason: rejectReason })}
                disabled={actionBusy}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium"
              >
                {actionBusy ? 'Rejecting…' : 'Reject Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-100">Mark as Paid</h3>
              <button onClick={() => setPayModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              Confirm reimbursement of{' '}
              <span className="text-zinc-100 font-semibold">{formatCurrency(report.totalAmount)}</span>
              {' '}to{' '}
              <span className="text-zinc-100 font-semibold">{report.employee.firstName} {report.employee.lastName}</span>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPayModal(false)}
                className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => doAction('pay')}
                disabled={actionBusy}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium"
              >
                {actionBusy ? 'Processing…' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-5xl mx-auto p-6 space-y-6">

          {/* Back nav */}
          <Link
            href="/hr/expenses"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Expense Reports
          </Link>

          {/* Header card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-lg font-bold text-zinc-100">{report.reportNo}</span>
                  <StatusBadge status={report.status} />
                </div>
                <p className="text-zinc-300 font-medium">{report.title}</p>
                <p className="text-zinc-500 text-sm mt-0.5">
                  {report.employee.firstName} {report.employee.lastName} · {report.employee.position}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Amount</div>
                <div className="text-3xl font-bold text-zinc-100 tabular-nums">{formatCurrency(report.totalAmount)}</div>
              </div>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/50 text-sm">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Created</div>
                <div className="text-zinc-300">{new Date(report.createdAt).toLocaleDateString()}</div>
              </div>
              {report.approvedAt && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Approved</div>
                  <div className="text-zinc-300">
                    {new Date(report.approvedAt).toLocaleDateString()} by {report.approvedBy}
                  </div>
                </div>
              )}
              {report.paidAt && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Paid</div>
                  <div className="text-emerald-400">{new Date(report.paidAt).toLocaleDateString()}</div>
                </div>
              )}
              {report.rejectedReason && (
                <div className="col-span-3">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Rejection Reason</div>
                  <div className="text-red-400">{report.rejectedReason}</div>
                </div>
              )}
              {report.notes && (
                <div className="col-span-3">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Notes</div>
                  <div className="text-zinc-400">{report.notes}</div>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50 mt-4">
              {report.status === 'draft' && (
                <button
                  onClick={() => doAction('submit')}
                  disabled={actionBusy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Submit for Approval
                </button>
              )}
              {report.status === 'submitted' && (
                <>
                  <button
                    onClick={() => setApproveModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              {report.status === 'approved' && (
                <button
                  onClick={() => setPayModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  Mark as Paid
                </button>
              )}
              {(report.status === 'paid' || report.status === 'rejected') && (
                <span className="text-zinc-500 text-sm">
                  {report.status === 'paid' ? 'Reimbursement complete.' : 'Report has been rejected.'}
                </span>
              )}
              <button
                onClick={() => router.push('/hr/expenses')}
                className="ml-auto px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm transition-colors"
              >
                Back to List
              </button>
            </div>
          </div>

          {/* Lines table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/50">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Expense Lines ({report.lines.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Category', 'Description', 'Amount', 'Date', 'Receipt Ref', 'Notes'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.lines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">No expense lines</td>
                    </tr>
                  )}
                  {report.lines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3"><CategoryBadge cat={line.category} /></td>
                      <td className="px-5 py-3 text-zinc-200">{line.description}</td>
                      <td className="px-5 py-3 font-semibold tabular-nums text-zinc-200">{formatCurrency(line.amount)}</td>
                      <td className="px-5 py-3 text-zinc-400">{new Date(line.expenseDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3 font-mono text-[12px] text-zinc-400">{line.receiptRef ?? '—'}</td>
                      <td className="px-5 py-3 text-zinc-500 text-[13px]">{line.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category breakdown */}
          {Object.keys(categoryTotals).length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                Totals by Category
              </h3>
              <div className="space-y-2">
                {Object.entries(categoryTotals).map(([cat, amt]) => {
                  const pct = report.totalAmount > 0 ? (amt / report.totalAmount) * 100 : 0
                  const cls = CATEGORY_BADGE[cat] ?? 'bg-zinc-700 text-zinc-400'
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium w-28 justify-center ${cls}`}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-current opacity-50"
                          style={{ width: `${pct.toFixed(1)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-zinc-200 w-24 text-right">
                        {formatCurrency(amt)}
                      </span>
                      <span className="text-xs text-zinc-500 w-12 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
