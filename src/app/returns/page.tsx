'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  RotateCcw,
  Plus,
  Search,
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  XCircle,
  Eye,
  ChevronRight,
} from 'lucide-react'

type ReturnLine = {
  id: string
  productName: string | null
  sku: string | null
  qtyRequested: number
  unitPrice: number
  returnReason: string | null
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
}

type NewLine = {
  productName: string
  sku: string
  qtyRequested: number
  unitPrice: number
  returnReason: string
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

const FILTER_TABS = ['All', 'Pending', 'Approved', 'Received', 'Inspecting', 'Complete', 'Denied']

const REFUND_METHODS = [
  { value: 'original_payment', label: 'Original Payment' },
  { value: 'store_credit', label: 'Store Credit' },
  { value: 'exchange', label: 'Exchange' },
]

const RETURN_REASONS = [
  'Defective / Not Working',
  'Wrong Item Shipped',
  'Changed Mind',
  'Item Not as Described',
  'Duplicate Order',
  'Arrived Too Late',
  'Missing Parts',
  'Other',
]

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-zinc-400', bg: 'bg-zinc-400/10 border-zinc-400/30' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium', cfg.color, cfg.bg)}>
      {cfg.label}
    </span>
  )
}

function emptyLine(): NewLine {
  return { productName: '', sku: '', qtyRequested: 1, unitPrice: 0, returnReason: '' }
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<RA[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // New RA form state
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    orderId: '',
    orderNumber: '',
    reason: '',
    refundMethod: 'original_payment',
    notes: '',
  })
  const [lines, setLines] = useState<NewLine[]>([emptyLine()])

  async function fetchReturns() {
    setLoading(true)
    const statusParam = activeTab !== 'All' ? `&status=${activeTab.toLowerCase()}` : ''
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
    const res = await fetch(`/api/returns?${statusParam}${searchParam}`)
    const data = await res.json()
    setReturns(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchReturns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchReturns()
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()])
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateLine(idx: number, field: keyof NewLine, value: string | number) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          orderId: form.orderId || null,
          orderNumber: form.orderNumber || null,
          customerEmail: form.customerEmail || null,
          notes: form.notes || null,
          lines: lines.filter((l) => l.productName.trim()),
        }),
      })
      if (res.ok) {
        setShowModal(false)
        setForm({ customerName: '', customerEmail: '', orderId: '', orderNumber: '', reason: '', refundMethod: 'original_payment', notes: '' })
        setLines([emptyLine()])
        fetchReturns()
      }
    } finally {
      setSubmitting(false)
    }
  }

  // KPI counts from loaded data (last 30 days for total)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const kpis = [
    {
      label: 'Total Returns (30d)',
      value: returns.filter((r) => r.createdAt >= thirtyDaysAgo).length,
      icon: RotateCcw,
      color: 'text-zinc-300',
    },
    {
      label: 'Pending Approval',
      value: returns.filter((r) => r.status === 'pending').length,
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      label: 'In Inspection',
      value: returns.filter((r) => r.status === 'inspecting').length,
      icon: Package,
      color: 'text-purple-400',
    },
    {
      label: 'Refunds Issued',
      value: returns.filter((r) => r.status === 'complete').length,
      icon: DollarSign,
      color: 'text-emerald-400',
    },
  ]

  // Pipeline counts
  const pipeline = ['pending', 'approved', 'received', 'inspecting', 'complete']
  const pipelineCounts = pipeline.map((s) => ({
    status: s,
    count: returns.filter((r) => r.status === s).length,
  }))

  return (
    <>
      <TopBar title="Returns & RMA" />
      <main className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh]">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((k) => (
            <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{k.label}</span>
                <k.icon className={cn('w-4 h-4', k.color)} />
              </div>
              <div className={cn('text-3xl font-bold', k.color)}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Status Pipeline */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Return Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {pipelineCounts.map((p, i) => {
              const cfg = STATUS_CONFIG[p.status]
              return (
                <div key={p.status} className="flex items-center gap-1 flex-shrink-0">
                  <div className={cn('flex flex-col items-center px-4 py-2.5 rounded-lg border min-w-[90px]', cfg.bg)}>
                    <span className={cn('text-xl font-bold', cfg.color)}>{p.count}</span>
                    <span className={cn('text-[10px] font-medium mt-0.5', cfg.color)}>{cfg.label}</span>
                  </div>
                  {i < pipelineCounts.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search RA#, customer..."
                className="pl-9 pr-3 h-9 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Return
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                activeTab === tab
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : returns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <RotateCcw className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">No returns found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Create the first return
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">RA Number</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Order #</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Reason</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Refund</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {returns.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-zinc-300">{r.raNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-zinc-200 text-xs font-medium">{r.customerName || <span className="text-zinc-600">—</span>}</div>
                        {r.customerEmail && (
                          <div className="text-zinc-500 text-[11px]">{r.customerEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                        {r.orderNumber || r.orderId || <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400 max-w-[160px] truncate">
                        {r.reason || <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-emerald-400 font-semibold text-xs">
                          {formatCurrency(r.totalRefund)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={`/returns/${r.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* New Return Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl mx-4 mb-10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-zinc-100">New Return Authorization</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Customer Info */}
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Customer Information</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Customer Name</label>
                    <input
                      value={form.customerName}
                      onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                      placeholder="Jane Smith"
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Customer Email</label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                      placeholder="jane@example.com"
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Order ID</label>
                    <input
                      value={form.orderId}
                      onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
                      placeholder="ORD-..."
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Order Number</label>
                    <input
                      value={form.orderNumber}
                      onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
                      placeholder="e.g. 10023"
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Return Details */}
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Return Details</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Reason</label>
                    <select
                      value={form.reason}
                      onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select reason...</option>
                      {RETURN_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Refund Method</label>
                    <select
                      value={form.refundMethod}
                      onChange={(e) => setForm((f) => ({ ...f, refundMethod: e.target.value }))}
                      className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {REFUND_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 block mb-1.5">Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      placeholder="Additional notes..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Return Items</div>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        {idx === 0 && <label className="text-[10px] text-zinc-500 block mb-1">Product Name</label>}
                        <input
                          value={line.productName}
                          onChange={(e) => updateLine(idx, 'productName', e.target.value)}
                          placeholder="Product name"
                          className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded-md px-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <label className="text-[10px] text-zinc-500 block mb-1">SKU</label>}
                        <input
                          value={line.sku}
                          onChange={(e) => updateLine(idx, 'sku', e.target.value)}
                          placeholder="SKU"
                          className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded-md px-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-1">
                        {idx === 0 && <label className="text-[10px] text-zinc-500 block mb-1">Qty</label>}
                        <input
                          type="number"
                          min={1}
                          value={line.qtyRequested}
                          onChange={(e) => updateLine(idx, 'qtyRequested', Number(e.target.value))}
                          className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded-md px-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <label className="text-[10px] text-zinc-500 block mb-1">Unit Price</label>}
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={line.unitPrice}
                          onChange={(e) => updateLine(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded-md px-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <label className="text-[10px] text-zinc-500 block mb-1">Return Reason</label>}
                        <input
                          value={line.returnReason}
                          onChange={(e) => updateLine(idx, 'returnReason', e.target.value)}
                          placeholder="Reason"
                          className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded-md px-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 h-9 px-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Return Authorization'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
