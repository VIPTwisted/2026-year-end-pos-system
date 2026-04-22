'use client'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  ShoppingCart,
  Truck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReorderItem {
  productId: string
  productName: string
  sku: string
  supplierId: string | null
  supplierName: string | null
  currentQty: number
  reorderPoint: number
  reorderQty: number
  unitCost: number
  totalCost: number
  daysOfStock: number | null
}

interface ReorderSummary {
  itemCount: number
  totalReorderCost: number
  supplierCount: number
}

interface ReorderData {
  items: ReorderItem[]
  summary: ReorderSummary
}

interface CreatedPO {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  itemCount: number
  totalAmount: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReorderReportPage() {
  const [data, setData] = useState<ReorderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Per-row edited quantities: productId → qty
  const [editedQtys, setEditedQtys] = useState<Record<string, number>>({})
  // Selected product IDs
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [generating, setGenerating] = useState(false)
  const [createdPOs, setCreatedPOs] = useState<CreatedPO[] | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const loadData = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/inventory/reorder')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load reorder data')
        return r.json() as Promise<ReorderData>
      })
      .then(d => {
        setData(d)
        // Default all items checked, default qtys from API
        const allSelected = new Set(d.items.map(i => i.productId))
        setSelected(allSelected)
        const defaultQtys: Record<string, number> = {}
        for (const item of d.items) {
          defaultQtys[item.productId] = item.reorderQty
        }
        setEditedQtys(defaultQtys)
        setCreatedPOs(null)
      })
      .catch(() => setError('Failed to load reorder data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleItem = (productId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const selectAll = () => {
    if (!data) return
    setSelected(new Set(data.items.map(i => i.productId)))
  }

  const deselectAll = () => setSelected(new Set())

  const updateQty = (productId: string, qty: number) => {
    setEditedQtys(prev => ({ ...prev, [productId]: Math.max(1, qty) }))
  }

  const selectedItems = data?.items.filter(i => selected.has(i.productId)) ?? []

  // Group selected by supplier for preview
  const supplierGroups = new Map<string, { supplierName: string; count: number }>()
  for (const item of selectedItems) {
    if (!item.supplierId) continue
    const key = item.supplierId
    const existing = supplierGroups.get(key)
    if (existing) existing.count++
    else supplierGroups.set(key, { supplierName: item.supplierName ?? 'Unknown', count: 1 })
  }

  const generatePOs = async () => {
    if (selectedItems.length === 0) {
      notify('No items selected', 'err')
      return
    }

    const itemsWithSupplier = selectedItems.filter(i => i.supplierId !== null)
    if (itemsWithSupplier.length === 0) {
      notify('Selected items have no supplier assigned', 'err')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/inventory/reorder/generate-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsWithSupplier.map(i => ({
            productId: i.productId,
            supplierId: i.supplierId!,
            qty: editedQtys[i.productId] ?? i.reorderQty,
            unitCost: i.unitCost,
          })),
        }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? 'Failed to generate purchase orders')
      }
      const result = (await res.json()) as { purchaseOrders: CreatedPO[] }
      setCreatedPOs(result.purchaseOrders)
      notify(`Created ${result.purchaseOrders.length} purchase order(s)`, 'ok')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Failed to generate purchase orders', 'err')
    } finally {
      setGenerating(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <TopBar title="Reorder Report" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-xl border transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
              : 'bg-red-950 border-red-700 text-red-300'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Reorder Report</h1>
              <p className="text-[13px] text-zinc-500 mt-0.5">
                Products at or below their reorder point — sorted by urgency
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 h-8 px-3 rounded text-[13px] border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-950/20 rounded-lg border border-red-800/40">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-[13px] text-red-300">{error}</p>
              <button onClick={loadData} className="ml-auto text-[13px] text-red-400 hover:text-red-300 underline">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                    Items to Reorder
                  </div>
                  <div className="flex items-end gap-2">
                    <div className={`text-2xl font-bold ${data.summary.itemCount > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                      {data.summary.itemCount}
                    </div>
                    <Package className="w-4 h-4 text-zinc-600 mb-1" />
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">at or below reorder point</div>
                </div>

                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                    Total Reorder Cost
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-amber-400 tabular-nums">
                      {formatCurrency(data.summary.totalReorderCost)}
                    </div>
                    <ShoppingCart className="w-4 h-4 text-zinc-600 mb-1" />
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">at cost price × suggested qty</div>
                </div>

                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                    Suppliers Involved
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-blue-400">
                      {data.summary.supplierCount}
                    </div>
                    <Truck className="w-4 h-4 text-zinc-600 mb-1" />
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">purchase orders to generate</div>
                </div>
              </div>

              {/* Empty state */}
              {data.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-[#16213e] rounded-lg border border-emerald-800/30">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                  <p className="text-[15px] font-semibold text-emerald-300">All stock levels are healthy</p>
                  <p className="text-[13px] text-zinc-500 mt-1">No products are at or below their reorder point</p>
                </div>
              )}

              {/* Reorder table */}
              {data.items.length > 0 && (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                  {/* Table toolbar */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/40">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[13px] font-semibold text-zinc-200">
                      {data.items.length} item{data.items.length !== 1 ? 's' : ''} need reordering
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={selectAll}
                        className="h-7 px-2.5 rounded text-[12px] text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={deselectAll}
                        className="h-7 px-2.5 rounded text-[12px] text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-800/40">
                          <th className="w-10 pb-2 pt-3 px-3"></th>
                          <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Product</th>
                          <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">SKU</th>
                          <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Supplier</th>
                          <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Current Qty</th>
                          <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Reorder Point</th>
                          <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Suggested Qty</th>
                          <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Unit Cost</th>
                          <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Total Cost</th>
                          <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Days of Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map(item => {
                          const isCritical = item.currentQty < item.reorderPoint / 2
                          const currentQty = editedQtys[item.productId] ?? item.reorderQty
                          const rowTotal = currentQty * item.unitCost

                          const daysColor =
                            item.daysOfStock === null
                              ? 'text-zinc-500'
                              : item.daysOfStock < 7
                              ? 'text-red-400 font-semibold'
                              : item.daysOfStock < 14
                              ? 'text-amber-400 font-semibold'
                              : 'text-emerald-400'

                          return (
                            <tr
                              key={item.productId}
                              className={`border-b border-zinc-800/40 last:border-0 transition-colors ${
                                selected.has(item.productId)
                                  ? 'bg-blue-950/10 hover:bg-blue-950/20'
                                  : 'hover:bg-zinc-800/20'
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selected.has(item.productId)}
                                  onChange={() => toggleItem(item.productId)}
                                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500 cursor-pointer"
                                />
                              </td>

                              {/* Product name */}
                              <td className="py-2.5 px-3">
                                <span className="text-[13px] font-medium text-zinc-100">{item.productName}</span>
                              </td>

                              {/* SKU */}
                              <td className="py-2.5 px-3 font-mono text-[12px] text-zinc-500">
                                {item.sku}
                              </td>

                              {/* Supplier */}
                              <td className="py-2.5 px-3 text-[13px]">
                                {item.supplierName ? (
                                  <span className="text-zinc-300">{item.supplierName}</span>
                                ) : (
                                  <span className="text-zinc-600 italic">No supplier</span>
                                )}
                              </td>

                              {/* Current qty — red if critical */}
                              <td className={`py-2.5 px-3 text-right text-[13px] font-semibold tabular-nums ${isCritical ? 'text-red-400' : 'text-zinc-200'}`}>
                                {item.currentQty}
                                {isCritical && (
                                  <AlertTriangle className="w-3 h-3 text-red-400 inline ml-1" />
                                )}
                              </td>

                              {/* Reorder point */}
                              <td className="py-2.5 px-3 text-right text-[13px] tabular-nums text-zinc-400">
                                {item.reorderPoint}
                              </td>

                              {/* Suggested qty — editable */}
                              <td className="py-2.5 px-3 text-right">
                                <input
                                  type="number"
                                  min={1}
                                  value={editedQtys[item.productId] ?? item.reorderQty}
                                  onChange={e => updateQty(item.productId, parseInt(e.target.value, 10) || 1)}
                                  className="w-20 h-7 rounded bg-zinc-900 border border-zinc-700 px-2 text-[13px] text-right text-zinc-100 tabular-nums focus:border-blue-500 focus:outline-none"
                                />
                              </td>

                              {/* Unit cost */}
                              <td className="py-2.5 px-3 text-right text-[13px] tabular-nums text-zinc-300">
                                {formatCurrency(item.unitCost)}
                              </td>

                              {/* Total cost */}
                              <td className="py-2.5 px-3 text-right text-[13px] tabular-nums font-semibold text-zinc-100">
                                {formatCurrency(rowTotal)}
                              </td>

                              {/* Days of stock */}
                              <td className={`py-2.5 px-3 text-right text-[13px] tabular-nums ${daysColor}`}>
                                {item.daysOfStock === null ? '—' : `${item.daysOfStock}d`}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Generate POs footer */}
              {data.items.length > 0 && (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-200">
                        {selected.size} item{selected.size !== 1 ? 's' : ''} selected
                      </p>
                      {supplierGroups.size > 0 ? (
                        <p className="text-[12px] text-zinc-500 mt-0.5">
                          Will create{' '}
                          <span className="text-blue-400 font-semibold">{supplierGroups.size}</span>{' '}
                          purchase order{supplierGroups.size !== 1 ? 's' : ''} for{' '}
                          <span className="text-blue-400 font-semibold">{supplierGroups.size}</span>{' '}
                          supplier{supplierGroups.size !== 1 ? 's' : ''}
                          {': '}
                          {Array.from(supplierGroups.values())
                            .map(g => g.supplierName)
                            .join(', ')}
                        </p>
                      ) : (
                        <p className="text-[12px] text-zinc-500 mt-0.5">
                          {selected.size > 0
                            ? 'Selected items have no supplier — assign suppliers to generate POs'
                            : 'Select items to generate purchase orders'}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={generatePOs}
                      disabled={generating || selected.size === 0}
                      className="flex items-center gap-2 h-9 px-5 rounded bg-blue-600 hover:bg-blue-700 text-[13px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      Generate Purchase Orders
                    </button>
                  </div>
                </div>
              )}

              {/* Created POs result */}
              {createdPOs && createdPOs.length > 0 && (
                <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-emerald-800/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[13px] font-semibold text-emerald-300">
                      {createdPOs.length} purchase order{createdPOs.length !== 1 ? 's' : ''} created
                    </span>
                  </div>
                  <div className="divide-y divide-emerald-900/30">
                    {createdPOs.map(po => (
                      <div key={po.id} className="flex items-center gap-4 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-semibold text-zinc-100 font-mono">{po.poNumber}</span>
                          <span className="text-[12px] text-zinc-500 ml-2">
                            {po.supplierName} · {po.itemCount} item{po.itemCount !== 1 ? 's' : ''} · {formatCurrency(po.totalAmount)}
                          </span>
                        </div>
                        <Link
                          href={`/purchasing/${po.id}`}
                          className="flex items-center gap-1.5 h-7 px-3 rounded text-[12px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
                        >
                          View PO
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
