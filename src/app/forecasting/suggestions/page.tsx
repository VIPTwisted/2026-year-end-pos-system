'use client'

import { useEffect, useState } from 'react'
import { Package, Plus, RefreshCw, X, CheckCircle, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  productId: string | null
  productName: string | null
  sku: string | null
  storeId: string | null
  storeName: string | null
  currentStock: number
  reorderPoint: number
  suggestedQty: number
  urgency: string
  status: string
  approvedBy: string | null
  purchaseOrderId: string | null
  notes: string | null
  createdAt: string
}

const urgencyBadge: Record<string, string> = {
  critical: 'text-red-300 bg-red-950/60 border-red-700',
  high: 'text-orange-300 bg-orange-950/60 border-orange-700',
  normal: 'text-blue-300 bg-blue-950/60 border-blue-700',
  low: 'text-zinc-400 bg-zinc-800 border-zinc-700',
}

const statusBadge: Record<string, string> = {
  pending: 'text-amber-300 bg-amber-950/40 border-amber-700',
  approved: 'text-emerald-300 bg-emerald-950/40 border-emerald-700',
  ordered: 'text-blue-300 bg-blue-950/40 border-blue-700',
  cancelled: 'text-zinc-500 bg-zinc-900 border-zinc-800',
}

const statusTabs = ['All', 'Pending', 'Approved', 'Ordered', 'Cancelled'] as const
type StatusTab = (typeof statusTabs)[number]

const urgencyFilters = ['All', 'Critical', 'High', 'Normal', 'Low'] as const
type UrgencyFilter = (typeof urgencyFilters)[number]

export default function SuggestionsPage() {
  const [statusTab, setStatusTab] = useState<StatusTab>('All')
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('All')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState<string | null>(null)
  const [poNumber, setPoNumber] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    productName: '', sku: '', storeName: '', storeId: '',
    currentStock: '', reorderPoint: '', suggestedQty: '', urgency: 'normal', notes: '',
  })

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusTab !== 'All') params.set('status', statusTab.toLowerCase())
      if (urgencyFilter !== 'All') params.set('urgency', urgencyFilter.toLowerCase())
      const res = await fetch(`/api/forecasting/suggestions?${params}`)
      const data = await res.json()
      setSuggestions(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusTab, urgencyFilter])

  async function createSuggestion() {
    if (!form.currentStock || !form.reorderPoint || !form.suggestedQty) return
    setCreating(true)
    try {
      await fetch('/api/forecasting/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: form.productName || undefined,
          sku: form.sku || undefined,
          storeId: form.storeId || undefined,
          storeName: form.storeName || undefined,
          currentStock: Number(form.currentStock),
          reorderPoint: Number(form.reorderPoint),
          suggestedQty: Number(form.suggestedQty),
          urgency: form.urgency,
          notes: form.notes || undefined,
        }),
      })
      setShowModal(false)
      setForm({ productName: '', sku: '', storeName: '', storeId: '', currentStock: '', reorderPoint: '', suggestedQty: '', urgency: 'normal', notes: '' })
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  async function approve(id: string) {
    await fetch(`/api/forecasting/suggestions/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy: 'manager' }),
    })
    load()
  }

  async function placeOrder(id: string) {
    await fetch(`/api/forecasting/suggestions/${id}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseOrderId: poNumber }),
    })
    setShowOrderModal(null)
    setPoNumber('')
    load()
  }

  async function cancel(id: string) {
    await fetch(`/api/forecasting/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            Replenishment Suggestions
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Review, approve, and order replenishment suggestions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Suggestion
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          {statusTabs.map((t) => (
            <button
              key={t}
              onClick={() => setStatusTab(t)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                statusTab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          {urgencyFilters.map((u) => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                urgencyFilter === u ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Store</th>
                <th className="text-center px-4 py-3">Current Stock</th>
                <th className="text-center px-4 py-3">Reorder Pt</th>
                <th className="text-center px-4 py-3">Suggested Qty</th>
                <th className="text-left px-4 py-3">Urgency</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : suggestions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-zinc-500 py-12">
                    No suggestions found.
                  </td>
                </tr>
              ) : (
                suggestions.map((s) => (
                  <tr
                    key={s.id}
                    className={cn(
                      'border-l-2 transition-colors hover:bg-zinc-800/30',
                      s.urgency === 'critical'
                        ? 'border-l-red-500'
                        : s.urgency === 'high'
                        ? 'border-l-orange-500'
                        : 'border-l-transparent'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{s.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-200">{s.productName ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{s.storeName ?? 'All'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('font-mono text-sm', s.currentStock <= s.reorderPoint ? 'text-red-400' : 'text-zinc-300')}>
                        {s.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-400 font-mono text-sm">{s.reorderPoint}</td>
                    <td className="px-4 py-3 text-center text-zinc-200 font-mono text-sm font-semibold">{s.suggestedQty}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', urgencyBadge[s.urgency] ?? urgencyBadge.normal)}>
                        {s.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusBadge[s.status] ?? statusBadge.pending)}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs max-w-32 truncate">{s.notes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {s.status === 'pending' && (
                          <button
                            onClick={() => approve(s.id)}
                            title="Approve"
                            className="p-1.5 bg-emerald-950/50 border border-emerald-800 rounded text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(s.status === 'pending' || s.status === 'approved') && (
                          <button
                            onClick={() => setShowOrderModal(s.id)}
                            title="Place Order"
                            className="p-1.5 bg-blue-950/50 border border-blue-800 rounded text-blue-300 hover:bg-blue-900/50 transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(s.status === 'pending' || s.status === 'approved') && (
                          <button
                            onClick={() => cancel(s.id)}
                            title="Cancel"
                            className="p-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 hover:text-red-400 hover:border-red-800 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Place Order</h2>
              <button onClick={() => setShowOrderModal(null)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Purchase Order Number</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="e.g. PO-2026-001"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOrderModal(null)}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => placeOrder(showOrderModal)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Replenishment Suggestion</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'productName', label: 'Product Name', type: 'text', placeholder: 'Widget A' },
                { key: 'sku', label: 'SKU', type: 'text', placeholder: 'SKU-001' },
                { key: 'storeName', label: 'Store Name', type: 'text', placeholder: 'Optional' },
                { key: 'storeId', label: 'Store ID', type: 'text', placeholder: 'Optional' },
                { key: 'currentStock', label: 'Current Stock *', type: 'number', placeholder: '5' },
                { key: 'reorderPoint', label: 'Reorder Point *', type: 'number', placeholder: '20' },
                { key: 'suggestedQty', label: 'Suggested Qty *', type: 'number', placeholder: '50' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Optional notes..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSuggestion}
                disabled={creating || !form.currentStock || !form.reorderPoint || !form.suggestedQty}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? 'Creating…' : 'Create Suggestion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
