'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  Plus,
  X,
  Trash2,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Vendor {
  id: string
  name: string
  vendorCode: string
}

interface PO {
  id: string
  poNumber: string
  status: string
  orderDate: string
  expectedDate: string | null
  totalAmt: number
  vendor: { id: string; name: string; vendorCode: string }
  _count: { lines: number }
}

const STATUSES = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'partial', label: 'Partial' },
  { key: 'received', label: 'Received' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'closed', label: 'Closed' },
]

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  sent: 'text-blue-400 bg-blue-900/30 border-blue-800',
  acknowledged: 'text-cyan-400 bg-cyan-900/30 border-cyan-800',
  partial: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  received: 'text-green-400 bg-green-900/30 border-green-800',
  cancelled: 'text-red-400 bg-red-900/30 border-red-800',
  closed: 'text-zinc-500 bg-zinc-800/50 border-zinc-700',
}

interface POLine {
  productName: string
  sku: string
  qtyOrdered: number
  unitCost: number
}

export default function POsPage() {
  const [pos, setPOs] = useState<PO[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [poForm, setPOForm] = useState({
    vendorId: '',
    expectedDate: '',
    shippingAddress: '',
    notes: '',
    taxAmt: 0,
    shippingAmt: 0,
  })
  const [poLines, setPOLines] = useState<POLine[]>([
    { productName: '', sku: '', qtyOrdered: 1, unitCost: 0 },
  ])

  const fetchPOs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/vendors/pos?${params}`)
      const data = await res.json()
      setPOs(Array.isArray(data) ? data : [])
    } catch {
      setPOs([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchPOs()
  }, [fetchPOs])

  useEffect(() => {
    fetch('/api/vendors?isActive=true')
      .then((r) => r.json())
      .then((d) => setVendors(Array.isArray(d) ? d : []))
      .catch(() => setVendors([]))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!poForm.vendorId) return
    setSaving(true)
    try {
      const res = await fetch('/api/vendors/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...poForm, lines: poLines }),
      })
      if (res.ok) {
        setShowModal(false)
        setPOForm({ vendorId: '', expectedDate: '', shippingAddress: '', notes: '', taxAmt: 0, shippingAmt: 0 })
        setPOLines([{ productName: '', sku: '', qtyOrdered: 1, unitCost: 0 }])
        fetchPOs()
      }
    } finally {
      setSaving(false)
    }
  }

  const subtotal = poLines.reduce((s, l) => s + l.qtyOrdered * l.unitCost, 0)
  const grandTotal = subtotal + poForm.taxAmt + poForm.shippingAmt

  return (
    <div className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            Purchase Orders
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">All vendor purchase orders</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New PO
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              statusFilter === s.key
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />
            ))}
          </div>
        ) : pos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No purchase orders found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">PO #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Order Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Expected</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Lines</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Total</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pos.map((po) => (
                <tr key={po.id} className="hover:bg-zinc-800/40 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                    {po.poNumber.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <div>
                        <div className="text-zinc-100 font-medium text-xs">{po.vendor.name}</div>
                        <div className="text-zinc-600 text-[10px] font-mono">{po.vendor.vendorCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {new Date(po.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-300 text-xs">{po._count.lines}</td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-100">
                    ${po.totalAmt.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 text-xs rounded-full font-medium border',
                        STATUS_COLORS[po.status] ?? STATUS_COLORS.draft
                      )}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/vendors/pos/${po.id}`}
                      className="text-xs text-zinc-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New PO Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">New Purchase Order</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Vendor *</label>
                <select
                  required
                  value={poForm.vendorId}
                  onChange={(e) => setPOForm((f) => ({ ...f, vendorId: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                >
                  <option value="">Select vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      [{v.vendorCode}] {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Expected Date</label>
                  <input
                    type="date"
                    value={poForm.expectedDate}
                    onChange={(e) => setPOForm((f) => ({ ...f, expectedDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Shipping Address</label>
                  <input
                    value={poForm.shippingAddress}
                    onChange={(e) => setPOForm((f) => ({ ...f, shippingAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Tax Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={poForm.taxAmt}
                    onChange={(e) => setPOForm((f) => ({ ...f, taxAmt: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Shipping Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={poForm.shippingAmt}
                    onChange={(e) => setPOForm((f) => ({ ...f, shippingAmt: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                <textarea
                  value={poForm.notes}
                  onChange={(e) => setPOForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none"
                />
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Line Items</label>
                  <button
                    type="button"
                    onClick={() =>
                      setPOLines((l) => [...l, { productName: '', sku: '', qtyOrdered: 1, unitCost: 0 }])
                    }
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Line
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 px-1">
                    <span className="col-span-4">Product</span>
                    <span className="col-span-2">SKU</span>
                    <span className="col-span-2">Qty</span>
                    <span className="col-span-3">Unit Cost</span>
                    <span className="col-span-1" />
                  </div>
                  {poLines.map((line, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        value={line.productName}
                        onChange={(e) =>
                          setPOLines((l) => l.map((x, j) => j === i ? { ...x, productName: e.target.value } : x))
                        }
                        placeholder="Product name"
                        className="col-span-4 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                      <input
                        value={line.sku}
                        onChange={(e) =>
                          setPOLines((l) => l.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))
                        }
                        placeholder="SKU"
                        className="col-span-2 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                      <input
                        type="number"
                        min="1"
                        value={line.qtyOrdered}
                        onChange={(e) =>
                          setPOLines((l) => l.map((x, j) => j === i ? { ...x, qtyOrdered: Number(e.target.value) } : x))
                        }
                        className="col-span-2 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitCost}
                        onChange={(e) =>
                          setPOLines((l) => l.map((x, j) => j === i ? { ...x, unitCost: Number(e.target.value) } : x))
                        }
                        className="col-span-3 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPOLines((l) => l.filter((_, j) => j !== i))}
                        disabled={poLines.length === 1}
                        className="col-span-1 text-zinc-600 hover:text-red-400 disabled:opacity-30 transition-colors flex justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-zinc-800 pt-3 space-y-1 text-xs text-right">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Tax</span>
                    <span>${poForm.taxAmt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Shipping</span>
                    <span>${poForm.shippingAmt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-100 font-semibold text-sm">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Creating...' : 'Create PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
