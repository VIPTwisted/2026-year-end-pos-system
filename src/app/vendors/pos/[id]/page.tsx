'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardList,
  Building2,
  Send,
  CheckCircle,
  X,
  Package,
  ChevronDown,
  ChevronRight,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface POLine {
  id: string
  productName: string | null
  sku: string | null
  qtyOrdered: number
  qtyReceived: number
  unitCost: number
  lineTotal: number
}

interface ReceiptLine {
  id: string
  productName: string | null
  sku: string | null
  qtyReceived: number
  condition: string | null
  notes: string | null
}

interface Receipt {
  id: string
  receiptNumber: string
  receivedBy: string | null
  receivedAt: string
  notes: string | null
  lines: ReceiptLine[]
}

interface PO {
  id: string
  poNumber: string
  status: string
  orderDate: string
  expectedDate: string | null
  receivedDate: string | null
  shippingAddress: string | null
  subtotal: number
  taxAmt: number
  shippingAmt: number
  totalAmt: number
  notes: string | null
  vendor: {
    id: string
    name: string
    vendorCode: string
    contactName: string | null
    email: string | null
    phone: string | null
    paymentTerms: string | null
  }
  lines: POLine[]
  receipts: Receipt[]
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  sent: 'text-blue-400 bg-blue-900/30 border-blue-800',
  acknowledged: 'text-cyan-400 bg-cyan-900/30 border-cyan-800',
  partial: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  received: 'text-green-400 bg-green-900/30 border-green-800',
  cancelled: 'text-red-400 bg-red-900/30 border-red-800',
  closed: 'text-zinc-500 bg-zinc-800 border-zinc-700',
}

const CONDITION_COLORS: Record<string, string> = {
  good: 'text-green-400',
  damaged: 'text-yellow-400',
  rejected: 'text-red-400',
}

interface ReceiveFormLine {
  poLineId: string
  productName: string
  sku: string
  qtyReceived: number
  condition: string
  notes: string
}

export default function PODetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [po, setPO] = useState<PO | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [receiveLines, setReceiveLines] = useState<ReceiveFormLine[]>([])
  const [receivedBy, setReceivedBy] = useState('')
  const [receiveNotes, setReceiveNotes] = useState('')
  const [receiveSaving, setReceiveSaving] = useState(false)
  const [actioning, setActioning] = useState(false)
  const [expandedReceipts, setExpandedReceipts] = useState<Set<string>>(new Set())

  const fetchPO = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/vendors/pos/${id}`)
      const data = await res.json()
      setPO(data)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPO()
  }, [fetchPO])

  function openReceiveModal() {
    if (!po) return
    setReceiveLines(
      po.lines
        .filter((l) => l.qtyReceived < l.qtyOrdered)
        .map((l) => ({
          poLineId: l.id,
          productName: l.productName ?? '',
          sku: l.sku ?? '',
          qtyReceived: l.qtyOrdered - l.qtyReceived,
          condition: 'good',
          notes: '',
        }))
    )
    setShowReceiveModal(true)
  }

  async function handleReceive(e: React.FormEvent) {
    e.preventDefault()
    setReceiveSaving(true)
    try {
      const res = await fetch(`/api/vendors/pos/${id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receivedBy: receivedBy || null,
          notes: receiveNotes || null,
          lines: receiveLines,
        }),
      })
      if (res.ok) {
        setShowReceiveModal(false)
        setReceivedBy('')
        setReceiveNotes('')
        fetchPO()
      }
    } finally {
      setReceiveSaving(false)
    }
  }

  async function handleSend() {
    if (!confirm('Send this PO to vendor?')) return
    setActioning(true)
    try {
      await fetch(`/api/vendors/pos/${id}/send`, { method: 'POST' })
      fetchPO()
    } finally {
      setActioning(false)
    }
  }

  async function handleClose() {
    if (!confirm('Close this PO?')) return
    setActioning(true)
    try {
      await fetch(`/api/vendors/pos/${id}/close`, { method: 'POST' })
      fetchPO()
    } finally {
      setActioning(false)
    }
  }

  function toggleReceipt(receiptId: string) {
    setExpandedReceipts((prev) => {
      const next = new Set(prev)
      if (next.has(receiptId)) next.delete(receiptId)
      else next.add(receiptId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-4 bg-zinc-950 min-h-[100dvh]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-zinc-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!po) {
    return (
      <div className="flex-1 p-6 bg-zinc-950 min-h-[100dvh] flex items-center justify-center">
        <p className="text-zinc-500">PO not found</p>
      </div>
    )
  }

  const canSend = po.status === 'draft'
  const canReceive = ['sent', 'acknowledged', 'partial'].includes(po.status)
  const canClose = !['cancelled', 'closed'].includes(po.status)

  return (
    <div className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vendors/pos" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-100 font-mono">
              PO-{po.poNumber.slice(0, 8).toUpperCase()}
            </h1>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium border',
                STATUS_COLORS[po.status] ?? STATUS_COLORS.draft
              )}
            >
              {po.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">{po.vendor.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {canSend && (
            <button
              onClick={handleSend}
              disabled={actioning}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Send PO
            </button>
          )}
          {canReceive && (
            <button
              onClick={openReceiveModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Package className="w-4 h-4" />
              Receive Shipment
            </button>
          )}
          {canClose && (
            <button
              onClick={handleClose}
              disabled={actioning}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-200 text-sm font-medium rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Close PO
            </button>
          )}
        </div>
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: PO metadata */}
        <div className="col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Order Details
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Order Date</span>
                <span className="text-zinc-200">{new Date(po.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Expected</span>
                <span className="text-zinc-200">
                  {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : '—'}
                </span>
              </div>
              {po.receivedDate && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Received</span>
                  <span className="text-green-400">{new Date(po.receivedDate).toLocaleDateString()}</span>
                </div>
              )}
              {po.shippingAddress && (
                <div className="flex justify-between col-span-2">
                  <span className="text-zinc-500">Ship To</span>
                  <span className="text-zinc-200">{po.shippingAddress}</span>
                </div>
              )}
              {po.notes && (
                <div className="col-span-2">
                  <span className="text-zinc-500 block mb-1">Notes</span>
                  <p className="text-zinc-300 text-xs bg-zinc-800 rounded p-2">{po.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>${po.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Tax</span>
                <span>${po.taxAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span>${po.shippingAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-100 font-semibold text-base pt-1 border-t border-zinc-800">
                <span>Total</span>
                <span>${po.totalAmt.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Lines Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                Line Items ({po.lines.length})
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">SKU</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Product</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Ordered</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Received</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Unit Cost</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {po.lines.map((line) => {
                  const pct = line.qtyOrdered > 0 ? (line.qtyReceived / line.qtyOrdered) * 100 : 0
                  const fulfilled = line.qtyReceived >= line.qtyOrdered
                  return (
                    <tr key={line.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{line.sku || '—'}</td>
                      <td className="px-4 py-3 text-zinc-200">{line.productName || '—'}</td>
                      <td className="px-4 py-3 text-center text-zinc-300">{line.qtyOrdered}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn('text-xs font-medium', fulfilled ? 'text-green-400' : 'text-zinc-300')}>
                            {line.qtyReceived}/{line.qtyOrdered}
                          </span>
                          <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', fulfilled ? 'bg-green-500' : 'bg-blue-500')}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">${line.unitCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-zinc-100 font-medium">${line.lineTotal.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Receipts history */}
          {po.receipts.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Receipt History ({po.receipts.length})
                </h2>
              </div>
              <div className="divide-y divide-zinc-800">
                {po.receipts.map((receipt) => {
                  const expanded = expandedReceipts.has(receipt.id)
                  return (
                    <div key={receipt.id}>
                      <button
                        onClick={() => toggleReceipt(receipt.id)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expanded ? (
                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                          )}
                          <div className="text-left">
                            <div className="text-sm text-zinc-200 font-mono">
                              RCP-{receipt.receiptNumber.slice(0, 8).toUpperCase()}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {new Date(receipt.receivedAt).toLocaleString()}
                              {receipt.receivedBy ? ` · ${receipt.receivedBy}` : ''}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-zinc-500">{receipt.lines.length} line{receipt.lines.length !== 1 ? 's' : ''}</span>
                      </button>
                      {expanded && (
                        <div className="px-6 pb-4">
                          {receipt.notes && (
                            <p className="text-xs text-zinc-500 mb-3 bg-zinc-800 rounded p-2">{receipt.notes}</p>
                          )}
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-zinc-600 border-b border-zinc-800">
                                <th className="text-left pb-2 font-medium">SKU</th>
                                <th className="text-left pb-2 font-medium">Product</th>
                                <th className="text-center pb-2 font-medium">Qty</th>
                                <th className="text-left pb-2 font-medium">Condition</th>
                                <th className="text-left pb-2 font-medium">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                              {receipt.lines.map((rl) => (
                                <tr key={rl.id}>
                                  <td className="py-2 font-mono text-zinc-600">{rl.sku || '—'}</td>
                                  <td className="py-2 text-zinc-300">{rl.productName || '—'}</td>
                                  <td className="py-2 text-center text-zinc-300">{rl.qtyReceived}</td>
                                  <td className={cn('py-2 font-medium capitalize', CONDITION_COLORS[rl.condition ?? 'good'] ?? 'text-zinc-400')}>
                                    {rl.condition || 'good'}
                                  </td>
                                  <td className="py-2 text-zinc-500">{rl.notes || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Vendor info card */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Vendor
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <Link
                  href={`/vendors/${po.vendor.id}`}
                  className="font-semibold text-zinc-100 hover:text-blue-400 transition-colors"
                >
                  {po.vendor.name}
                </Link>
                <div className="font-mono text-xs text-zinc-500 mt-0.5">{po.vendor.vendorCode}</div>
              </div>
              {po.vendor.contactName && (
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Contact</span>
                  <span className="text-zinc-300">{po.vendor.contactName}</span>
                </div>
              )}
              {po.vendor.email && (
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Email</span>
                  <a href={`mailto:${po.vendor.email}`} className="text-blue-400 hover:text-blue-300">
                    {po.vendor.email}
                  </a>
                </div>
              )}
              {po.vendor.phone && (
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Phone</span>
                  <span className="text-zinc-300">{po.vendor.phone}</span>
                </div>
              )}
              {po.vendor.paymentTerms && (
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Terms</span>
                  <span className="text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">{po.vendor.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Receive Shipment Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">Receive Shipment</h2>
              <button onClick={() => setShowReceiveModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReceive} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Received By</label>
                  <input
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    placeholder="Staff name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                  <input
                    value={receiveNotes}
                    onChange={(e) => setReceiveNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wide mb-2">Receipt Lines</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 px-1">
                    <span className="col-span-4">Product / SKU</span>
                    <span className="col-span-2">Qty Recv.</span>
                    <span className="col-span-3">Condition</span>
                    <span className="col-span-3">Notes</span>
                  </div>
                  {receiveLines.map((rl, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400">
                        {rl.productName || rl.sku || `Line ${i + 1}`}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={rl.qtyReceived}
                        onChange={(e) =>
                          setReceiveLines((l) => l.map((x, j) => j === i ? { ...x, qtyReceived: Number(e.target.value) } : x))
                        }
                        className="col-span-2 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                      <select
                        value={rl.condition}
                        onChange={(e) =>
                          setReceiveLines((l) => l.map((x, j) => j === i ? { ...x, condition: e.target.value } : x))
                        }
                        className="col-span-3 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      >
                        <option value="good">Good</option>
                        <option value="damaged">Damaged</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <input
                        value={rl.notes}
                        onChange={(e) =>
                          setReceiveLines((l) => l.map((x, j) => j === i ? { ...x, notes: e.target.value } : x))
                        }
                        placeholder="Notes"
                        className="col-span-3 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  ))}
                  {receiveLines.length === 0 && (
                    <p className="text-xs text-zinc-600 text-center py-4">All lines are fully received.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowReceiveModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={receiveSaving || receiveLines.length === 0}
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {receiveSaving ? 'Processing...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
