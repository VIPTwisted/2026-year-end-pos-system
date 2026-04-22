'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  Package,
  Search,
  DollarSign,
  FileText,
  AlertTriangle,
  Clock,
  ChevronRight,
  Save,
  Eye,
} from 'lucide-react'
import Link from 'next/link'

type ReturnLine = {
  id: string
  productId: string | null
  productName: string | null
  sku: string | null
  qtyRequested: number
  qtyReceived: number
  unitPrice: number
  returnReason: string | null
  condition: string | null
  disposition: string | null
  restocked: boolean
  createdAt: string
}

type ReturnInspection = {
  id: string
  inspectedBy: string | null
  overallCondition: string | null
  notes: string | null
  passedInspection: boolean
  inspectedAt: string | null
  createdAt: string
}

type ReturnRefund = {
  id: string
  refundMethod: string | null
  refundAmount: number
  transactionId: string | null
  processedBy: string | null
  processedAt: string | null
  createdAt: string
}

type RA = {
  id: string
  raNumber: string
  orderId: string | null
  orderNumber: string | null
  customerId: string | null
  customerName: string | null
  customerEmail: string | null
  status: string
  reason: string | null
  refundMethod: string | null
  totalRefund: number
  notes: string | null
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  lines: ReturnLine[]
  inspection: ReturnInspection | null
  refundRecord: ReturnRefund | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
  approved: { label: 'Approved', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  received: { label: 'Received', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
  inspecting: { label: 'Inspecting', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
  complete: { label: 'Complete', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
  denied: { label: 'Denied', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  cancelled: { label: 'Cancelled', color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/30' },
}

const CONDITION_OPTIONS = ['new', 'good', 'damaged', 'unsaleable']
const DISPOSITION_OPTIONS = ['restock', 'refurbish', 'discard', 'vendor_return']
const REFUND_METHODS = [
  { value: 'original_payment', label: 'Original Payment' },
  { value: 'store_credit', label: 'Store Credit' },
  { value: 'exchange', label: 'Exchange' },
]

const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'lines', label: 'Line Items', icon: Package },
  { id: 'inspection', label: 'Inspection', icon: Search },
  { id: 'refund', label: 'Refund', icon: DollarSign },
]

const PIPELINE = ['pending', 'approved', 'received', 'inspecting', 'complete']

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-zinc-400', bg: 'bg-zinc-400/10 border-zinc-400/30' }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded border text-xs font-semibold', cfg.color, cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export default function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [ra, setRa] = useState<RA | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [actionLoading, setActionLoading] = useState('')
  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)

  // Lines tab state
  const [lineEdits, setLineEdits] = useState<Record<string, { qtyReceived: number; condition: string; disposition: string }>>({})
  const [receiveSaving, setReceiveSaving] = useState(false)

  // Inspection tab state
  const [inspForm, setInspForm] = useState({
    inspectedBy: '',
    overallCondition: 'good',
    notes: '',
    passedInspection: false,
  })
  const [inspSaving, setInspSaving] = useState(false)

  // Refund tab state
  const [refundForm, setRefundForm] = useState({
    refundMethod: 'original_payment',
    refundAmount: 0,
    transactionId: '',
    processedBy: '',
  })
  const [refundSaving, setRefundSaving] = useState(false)

  const fetchRA = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/returns/${id}`)
      const data: RA = await res.json()
      setRa(data)
      setNotes(data.notes ?? '')
      setRefundForm((f) => ({ ...f, refundAmount: data.totalRefund, refundMethod: data.refundMethod ?? 'original_payment' }))
      // Initialize line edits
      const edits: typeof lineEdits = {}
      data.lines.forEach((l) => {
        edits[l.id] = {
          qtyReceived: l.qtyReceived,
          condition: l.condition ?? 'good',
          disposition: l.disposition ?? 'restock',
        }
      })
      setLineEdits(edits)
      // Pre-fill inspection if exists
      if (data.inspection) {
        setInspForm({
          inspectedBy: data.inspection.inspectedBy ?? '',
          overallCondition: data.inspection.overallCondition ?? 'good',
          notes: data.inspection.notes ?? '',
          passedInspection: data.inspection.passedInspection,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRA()
  }, [fetchRA])

  async function doAction(action: string, body?: Record<string, unknown>) {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/returns/${id}/${action}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      })
      if (res.ok) await fetchRA()
    } finally {
      setActionLoading('')
    }
  }

  async function saveNotes() {
    setNotesSaving(true)
    try {
      await fetch(`/api/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      await fetchRA()
    } finally {
      setNotesSaving(false)
    }
  }

  async function saveReceive() {
    if (!ra) return
    setReceiveSaving(true)
    try {
      const lines = ra.lines.map((l) => ({
        id: l.id,
        qtyReceived: lineEdits[l.id]?.qtyReceived ?? l.qtyReceived,
        condition: lineEdits[l.id]?.condition ?? l.condition,
        disposition: lineEdits[l.id]?.disposition ?? l.disposition,
      }))
      await doAction('receive', { lines })
    } finally {
      setReceiveSaving(false)
    }
  }

  async function saveInspection() {
    setInspSaving(true)
    try {
      await doAction('inspect', inspForm)
    } finally {
      setInspSaving(false)
    }
  }

  async function saveRefund() {
    setRefundSaving(true)
    try {
      await doAction('refund', refundForm)
    } finally {
      setRefundSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Return Detail" />
        <main className="flex-1 p-6 bg-zinc-950 min-h-[100dvh]">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-zinc-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
      </>
    )
  }

  if (!ra) {
    return (
      <>
        <TopBar title="Return Detail" />
        <main className="flex-1 p-6 bg-zinc-950 min-h-[100dvh] flex flex-col items-center justify-center text-zinc-500">
          <AlertTriangle className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">Return authorization not found</p>
          <Link href="/returns" className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Back to Returns
          </Link>
        </main>
      </>
    )
  }

  const pipelineIdx = PIPELINE.indexOf(ra.status)

  return (
    <>
      <TopBar title={`RA: ${ra.raNumber}`} />
      <main className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh]">

        {/* Back */}
        <Link
          href="/returns"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Returns
        </Link>

        {/* Header Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-5">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-zinc-100 font-mono">{ra.raNumber}</h1>
                <StatusBadge status={ra.status} />
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-xs text-zinc-400">
                {ra.customerName && (
                  <div>Customer: <span className="text-zinc-200">{ra.customerName}</span></div>
                )}
                {ra.customerEmail && (
                  <div>Email: <span className="text-zinc-200">{ra.customerEmail}</span></div>
                )}
                {ra.orderNumber && (
                  <div>Order: <span className="font-mono text-blue-400">{ra.orderNumber}</span></div>
                )}
                {ra.reason && (
                  <div>Reason: <span className="text-zinc-200">{ra.reason}</span></div>
                )}
                {ra.refundMethod && (
                  <div>Refund Method: <span className="text-zinc-200 capitalize">{ra.refundMethod.replace(/_/g, ' ')}</span></div>
                )}
                <div>Created: <span className="text-zinc-200">{formatDate(ra.createdAt)}</span></div>
                {ra.approvedBy && (
                  <div>Approved By: <span className="text-zinc-200">{ra.approvedBy}</span></div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500 mb-1">Total Refund</div>
              <div className="text-2xl font-bold text-emerald-400">{formatCurrency(ra.totalRefund)}</div>
            </div>
          </div>

          {/* Pipeline */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {PIPELINE.map((s, i) => {
              const cfg = STATUS_CONFIG[s]
              const isActive = i === pipelineIdx
              const isPast = i < pipelineIdx
              return (
                <div key={s} className="flex items-center gap-1 flex-shrink-0">
                  <div className={cn(
                    'px-3 py-1 rounded-md text-[10px] font-semibold border',
                    isActive ? cn(cfg.color, cfg.bg) : isPast ? 'text-zinc-500 border-zinc-700 bg-zinc-800/40' : 'text-zinc-600 border-zinc-800'
                  )}>
                    {cfg.label}
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ChevronRight className={cn('w-3 h-3 flex-shrink-0', isPast ? 'text-zinc-600' : 'text-zinc-800')} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Context-sensitive action buttons */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-800">
            {ra.status === 'pending' && (
              <>
                <button
                  onClick={() => doAction('approve')}
                  disabled={actionLoading === 'approve'}
                  className="flex items-center gap-1.5 h-8 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => doAction('deny')}
                  disabled={actionLoading === 'deny'}
                  className="flex items-center gap-1.5 h-8 px-4 bg-zinc-800 hover:bg-red-900/60 border border-zinc-700 hover:border-red-700 disabled:opacity-60 text-zinc-300 hover:text-red-300 text-xs font-medium rounded-lg transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {actionLoading === 'deny' ? 'Denying...' : 'Deny'}
                </button>
              </>
            )}
            {ra.status === 'approved' && (
              <button
                onClick={() => { setActiveTab('lines'); saveReceive() }}
                disabled={actionLoading === 'receive'}
                className="flex items-center gap-1.5 h-8 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                {actionLoading === 'receive' ? 'Marking...' : 'Mark Received'}
              </button>
            )}
            {ra.status === 'received' && (
              <button
                onClick={() => setActiveTab('inspection')}
                className="flex items-center gap-1.5 h-8 px-4 bg-purple-700 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Start Inspection
              </button>
            )}
            {ra.status === 'inspecting' && ra.inspection?.passedInspection && (
              <button
                onClick={() => setActiveTab('refund')}
                className="flex items-center gap-1.5 h-8 px-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Process Refund
              </button>
            )}
            {ra.status === 'complete' && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <CheckCircle className="w-4 h-4" />
                Return Complete — Refund Processed
              </div>
            )}
            {ra.status === 'denied' && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
                <XCircle className="w-4 h-4" />
                Return Authorization Denied
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-zinc-800 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-semibold text-zinc-300">Notes</span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add notes..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none mb-3"
              />
              <button
                onClick={saveNotes}
                disabled={notesSaving}
                className="flex items-center gap-1.5 h-8 px-4 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-60 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {notesSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Summary info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="text-sm font-semibold text-zinc-300 mb-3">RA Summary</div>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'RA Number', value: ra.raNumber },
                  { label: 'Status', value: <StatusBadge status={ra.status} /> },
                  { label: 'Customer', value: ra.customerName ?? '—' },
                  { label: 'Email', value: ra.customerEmail ?? '—' },
                  { label: 'Order', value: ra.orderNumber ?? ra.orderId ?? '—' },
                  { label: 'Reason', value: ra.reason ?? '—' },
                  { label: 'Refund Method', value: ra.refundMethod?.replace(/_/g, ' ') ?? '—' },
                  { label: 'Total Refund', value: <span className="text-emerald-400 font-bold">{formatCurrency(ra.totalRefund)}</span> },
                  { label: 'Created', value: formatDate(ra.createdAt) },
                  { label: 'Last Updated', value: formatDate(ra.updatedAt) },
                  ...(ra.approvedBy ? [{ label: 'Approved By', value: ra.approvedBy }] : []),
                  ...(ra.approvedAt ? [{ label: 'Approved At', value: formatDate(ra.approvedAt) }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="text-zinc-500">{label}</dt>
                    <dd className="text-zinc-200">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* Tab: Line Items */}
        {activeTab === 'lines' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-300">Line Items ({ra.lines.length})</span>
              {(ra.status === 'approved' || ra.status === 'received') && (
                <button
                  onClick={saveReceive}
                  disabled={receiveSaving}
                  className="flex items-center gap-1.5 h-8 px-4 bg-orange-700 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {receiveSaving ? 'Saving...' : 'Update Received Quantities'}
                </button>
              )}
            </div>
            {ra.lines.length === 0 ? (
              <div className="py-12 text-center text-zinc-600 text-sm">No line items</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      {['SKU', 'Product', 'Qty Req', 'Qty Recv', 'Condition', 'Disposition', 'Unit Price', 'Total'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {ra.lines.map((line) => {
                      const edit = lineEdits[line.id] ?? { qtyReceived: line.qtyReceived, condition: line.condition ?? 'good', disposition: line.disposition ?? 'restock' }
                      const canEdit = ra.status === 'approved' || ra.status === 'received'
                      return (
                        <tr key={line.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-zinc-500">{line.sku ?? '—'}</td>
                          <td className="px-4 py-3">
                            <div className="text-zinc-200 text-xs font-medium">{line.productName ?? '—'}</div>
                            {line.returnReason && (
                              <div className="text-zinc-600 text-[10px]">{line.returnReason}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-xs text-center">{line.qtyRequested}</td>
                          <td className="px-4 py-3">
                            {canEdit ? (
                              <input
                                type="number"
                                min={0}
                                max={line.qtyRequested}
                                value={edit.qtyReceived}
                                onChange={(e) =>
                                  setLineEdits((prev) => ({
                                    ...prev,
                                    [line.id]: { ...edit, qtyReceived: Number(e.target.value) },
                                  }))
                                }
                                className="w-16 h-7 bg-zinc-800 border border-zinc-700 rounded px-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                              />
                            ) : (
                              <span className="text-xs text-zinc-300">{line.qtyReceived}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {canEdit ? (
                              <select
                                value={edit.condition}
                                onChange={(e) =>
                                  setLineEdits((prev) => ({
                                    ...prev,
                                    [line.id]: { ...edit, condition: e.target.value },
                                  }))
                                }
                                className="h-7 bg-zinc-800 border border-zinc-700 rounded px-2 text-xs text-zinc-100 focus:outline-none"
                              >
                                {CONDITION_OPTIONS.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs text-zinc-400 capitalize">{line.condition ?? '—'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {canEdit ? (
                              <select
                                value={edit.disposition}
                                onChange={(e) =>
                                  setLineEdits((prev) => ({
                                    ...prev,
                                    [line.id]: { ...edit, disposition: e.target.value },
                                  }))
                                }
                                className="h-7 bg-zinc-800 border border-zinc-700 rounded px-2 text-xs text-zinc-100 focus:outline-none"
                              >
                                {DISPOSITION_OPTIONS.map((d) => (
                                  <option key={d} value={d}>{d.replace('_', ' ')}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs text-zinc-400 capitalize">{line.disposition?.replace('_', ' ') ?? '—'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-400 text-right">
                            {formatCurrency(line.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-emerald-400 text-right">
                            {formatCurrency(line.unitPrice * line.qtyRequested)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700">
                      <td colSpan={7} className="px-4 py-3 text-xs font-semibold text-zinc-400 text-right">
                        Total
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-400 text-right">
                        {formatCurrency(ra.lines.reduce((s, l) => s + l.unitPrice * l.qtyRequested, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Inspection */}
        {activeTab === 'inspection' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-zinc-300">Inspection Report</span>
            </div>

            {ra.inspection && (
              <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-400">Last Inspection</span>
                  <span className={cn(
                    'text-xs font-medium',
                    ra.inspection.passedInspection ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {ra.inspection.passedInspection ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                {ra.inspection.inspectedAt && (
                  <div className="text-xs text-zinc-500">
                    Inspected at: {formatDate(ra.inspection.inspectedAt)}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Inspected By</label>
                <input
                  value={inspForm.inspectedBy}
                  onChange={(e) => setInspForm((f) => ({ ...f, inspectedBy: e.target.value }))}
                  placeholder="Staff name"
                  className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Overall Condition</label>
                <select
                  value={inspForm.overallCondition}
                  onChange={(e) => setInspForm((f) => ({ ...f, overallCondition: e.target.value }))}
                  className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-zinc-500 block mb-1.5">Inspection Notes</label>
                <textarea
                  value={inspForm.notes}
                  onChange={(e) => setInspForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Describe condition, any damage, missing parts..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setInspForm((f) => ({ ...f, passedInspection: !f.passedInspection }))}
                    className={cn(
                      'relative w-10 h-5 rounded-full transition-colors border',
                      inspForm.passedInspection
                        ? 'bg-emerald-600 border-emerald-500'
                        : 'bg-zinc-700 border-zinc-600'
                    )}
                  >
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                      inspForm.passedInspection ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </div>
                  <span className="text-sm text-zinc-300">
                    Passed Inspection
                    {inspForm.passedInspection && (
                      <span className="ml-2 text-xs text-emerald-400">(will advance status to Inspecting)</span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={saveInspection}
              disabled={inspSaving}
              className="flex items-center gap-1.5 h-9 px-5 bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {inspSaving ? 'Submitting...' : 'Submit Inspection'}
            </button>
          </div>
        )}

        {/* Tab: Refund */}
        {activeTab === 'refund' && (
          <div className="space-y-4">
            {ra.refundRecord ? (
              <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-base font-bold text-emerald-400">Refund Processed</span>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Refund Amount', value: <span className="text-emerald-400 font-bold text-sm">{formatCurrency(ra.refundRecord.refundAmount)}</span> },
                    { label: 'Method', value: ra.refundRecord.refundMethod?.replace(/_/g, ' ') ?? '—' },
                    { label: 'Transaction ID', value: ra.refundRecord.transactionId ?? '—' },
                    { label: 'Processed By', value: ra.refundRecord.processedBy ?? '—' },
                    { label: 'Processed At', value: ra.refundRecord.processedAt ? formatDate(ra.refundRecord.processedAt) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-zinc-500 mb-0.5">{label}</dt>
                      <dd className="text-zinc-200">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-zinc-300">Process Refund</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Refund Method</label>
                    <select
                      value={refundForm.refundMethod}
                      onChange={(e) => setRefundForm((f) => ({ ...f, refundMethod: e.target.value }))}
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {REFUND_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Refund Amount</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={refundForm.refundAmount}
                      onChange={(e) => setRefundForm((f) => ({ ...f, refundAmount: Number(e.target.value) }))}
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Transaction ID</label>
                    <input
                      value={refundForm.transactionId}
                      onChange={(e) => setRefundForm((f) => ({ ...f, transactionId: e.target.value }))}
                      placeholder="TXN-..."
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Processed By</label>
                    <input
                      value={refundForm.processedBy}
                      onChange={(e) => setRefundForm((f) => ({ ...f, processedBy: e.target.value }))}
                      placeholder="Staff name"
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="bg-zinc-800/60 rounded-lg p-3 mb-4 text-xs">
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Refund Amount</span>
                    <span className="font-bold text-emerald-400 text-sm">{formatCurrency(refundForm.refundAmount)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Method</span>
                    <span className="capitalize">{refundForm.refundMethod.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <button
                  onClick={saveRefund}
                  disabled={refundSaving}
                  className="flex items-center gap-1.5 h-9 px-5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  {refundSaving ? 'Processing...' : `Confirm Refund ${formatCurrency(refundForm.refundAmount)}`}
                </button>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="text-sm font-semibold text-zinc-300 mb-4">RA History Timeline</div>
              <div className="space-y-3">
                {[
                  { icon: RotateCcw, label: 'Return Authorization Created', time: ra.createdAt, color: 'text-zinc-400' },
                  ...(ra.approvedAt ? [{ icon: CheckCircle, label: `Approved by ${ra.approvedBy ?? 'System'}`, time: ra.approvedAt, color: 'text-blue-400' }] : []),
                  ...(ra.inspection?.inspectedAt ? [{
                    icon: Search,
                    label: `Inspected — ${ra.inspection.passedInspection ? 'PASSED' : 'FAILED'} (${ra.inspection.overallCondition ?? 'N/A'})`,
                    time: ra.inspection.inspectedAt,
                    color: ra.inspection.passedInspection ? 'text-emerald-400' : 'text-red-400',
                  }] : []),
                  ...(ra.refundRecord?.processedAt ? [{
                    icon: DollarSign,
                    label: `Refund Processed — ${formatCurrency(ra.refundRecord.refundAmount)} via ${ra.refundRecord.refundMethod?.replace(/_/g, ' ') ?? 'N/A'}`,
                    time: ra.refundRecord.processedAt,
                    color: 'text-emerald-400',
                  }] : []),
                ].map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn('mt-0.5 flex-shrink-0', event.color)}>
                      <event.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-300">{event.label}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{formatDate(event.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
