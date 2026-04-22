'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import {
  Search,
  RefreshCw,
  Save,
  RotateCcw,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
}

interface WorksheetProduct {
  id: string
  name: string
  sku: string
  costPrice: number
  salePrice: number
  category: { id: string; name: string } | null
}

interface RowState {
  selected: boolean
  newPrice: string // string so input is controlled without rounding issues
}

type AdjustMode =
  | 'markup_over_cost'
  | 'increase_current'
  | 'decrease_current'
  | 'exact_margin'

// ── Helpers ──────────────────────────────────────────────────────────────────

function calcMarkupPct(cost: number, price: number): number {
  if (cost <= 0) return 0
  return ((price - cost) / cost) * 100
}

function calcChangePct(original: number, newVal: number): number {
  if (original <= 0) return 0
  return ((newVal - original) / original) * 100
}

function applyAdjustment(
  product: WorksheetProduct,
  mode: AdjustMode,
  pct: number
): number {
  const cost = product.costPrice
  const current = product.salePrice
  switch (mode) {
    case 'markup_over_cost':
      return cost * (1 + pct / 100)
    case 'increase_current':
      return current * (1 + pct / 100)
    case 'decrease_current':
      return current * (1 - pct / 100)
    case 'exact_margin':
      // margin = (price - cost) / price  =>  price = cost / (1 - margin%)
      if (pct >= 100) return current
      return cost / (1 - pct / 100)
    default:
      return current
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PriceWorksheetPage() {
  // Data state
  const [products, setProducts] = useState<WorksheetProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')

  // Row state: keyed by product id
  const [rows, setRows] = useState<Record<string, RowState>>({})

  // Bulk adjustment panel
  const [adjustMode, setAdjustMode] = useState<AdjustMode>('markup_over_cost')
  const [adjustPct, setAdjustPct] = useState<string>('30')

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Notifications ──────────────────────────────────────────────────────────

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // ── Load categories once ───────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/products/categories')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((data: Category[]) => setCategories(data))
      .catch(() => {/* categories are non-fatal */})
  }, [])

  // ── Load products on filter change ────────────────────────────────────────

  const loadProducts = useCallback((category: string, search: string) => {
    setLoading(true)
    setError(null)
    const sp = new URLSearchParams()
    if (category) sp.set('categoryId', category)
    if (search) sp.set('search', search)
    fetch(`/api/products/price-worksheet?${sp.toString()}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((data: WorksheetProduct[]) => {
        setProducts(data)
        // Initialise row states — preserve existing edits for rows already present
        setRows(prev => {
          const next: Record<string, RowState> = {}
          data.forEach(p => {
            next[p.id] = prev[p.id] ?? { selected: false, newPrice: '' }
          })
          return next
        })
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  useEffect(() => {
    loadProducts(categoryFilter, debouncedSearch)
  }, [categoryFilter, debouncedSearch, loadProducts])

  // ── Derived ────────────────────────────────────────────────────────────────

  const modifiedIds = products
    .filter(p => {
      const r = rows[p.id]
      return r && r.newPrice !== '' && parseFloat(r.newPrice) !== p.salePrice
    })
    .map(p => p.id)

  const selectedIds = products.filter(p => rows[p.id]?.selected).map(p => p.id)
  const allSelected = products.length > 0 && selectedIds.length === products.length

  // ── Row helpers ────────────────────────────────────────────────────────────

  const toggleAll = () => {
    const next = !allSelected
    setRows(prev => {
      const updated = { ...prev }
      products.forEach(p => {
        updated[p.id] = { ...updated[p.id], selected: next }
      })
      return updated
    })
  }

  const toggleRow = (id: string) => {
    setRows(prev => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id]?.selected },
    }))
  }

  const setNewPrice = (id: string, val: string) => {
    setRows(prev => ({
      ...prev,
      [id]: { ...prev[id], newPrice: val },
    }))
  }

  // ── Bulk adjustment ────────────────────────────────────────────────────────

  const applyToSet = (ids: string[]) => {
    const pct = parseFloat(adjustPct)
    if (isNaN(pct) || pct < 0) {
      notify('Enter a valid percentage', 'err')
      return
    }
    setRows(prev => {
      const updated = { ...prev }
      ids.forEach(id => {
        const product = products.find(p => p.id === id)
        if (!product) return
        const calculated = round2(applyAdjustment(product, adjustMode, pct))
        updated[id] = { ...updated[id], newPrice: calculated.toFixed(2) }
      })
      return updated
    })
  }

  const handleApplyToSelected = () => {
    if (selectedIds.length === 0) {
      notify('Select at least one row first', 'err')
      return
    }
    applyToSet(selectedIds)
  }

  const handleApplyToAllFiltered = () => {
    applyToSet(products.map(p => p.id))
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setRows(prev => {
      const next = { ...prev }
      products.forEach(p => {
        next[p.id] = { ...next[p.id], newPrice: '' }
      })
      return next
    })
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const updates = modifiedIds.map(id => ({
      id,
      newPrice: round2(parseFloat(rows[id].newPrice)),
    }))
    if (updates.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/products/price-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Save failed')
      }
      notify(`Saved ${updates.length} price${updates.length !== 1 ? 's' : ''}`)
      // Refresh to show new salePrice values, clear edits
      loadProducts(categoryFilter, debouncedSearch)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Save failed', 'err')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <TopBar title="Price Worksheet" />

      <main className="bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-5">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Bulk Price Worksheet</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Adjust prices across multiple products at once
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadProducts(categoryFilter, debouncedSearch)}
                className="h-8 px-3 rounded text-xs font-medium bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex flex-wrap items-end gap-4">
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Category
              </label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="h-8 pl-3 pr-7 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Name or SKU…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 w-52 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ── Bulk adjustment panel ────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              Bulk Price Adjustment
            </div>
            <div className="flex flex-wrap items-end gap-4">
              {/* Mode radios */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Method
                </label>
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      { value: 'markup_over_cost', label: '% Markup over cost' },
                      { value: 'increase_current', label: '% Increase current price' },
                      { value: 'decrease_current', label: '% Decrease current price' },
                      { value: 'exact_margin', label: 'Set exact margin %' },
                    ] as { value: AdjustMode; label: string }[]
                  ).map(opt => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="adjustMode"
                        value={opt.value}
                        checked={adjustMode === opt.value}
                        onChange={() => setAdjustMode(opt.value)}
                        className="accent-blue-500"
                      />
                      <span className="text-xs text-zinc-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Percentage input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={adjustPct}
                    onChange={e => setAdjustPct(e.target.value)}
                    className="h-8 pl-3 pr-7 w-28 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 tabular-nums"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">%</span>
                </div>
              </div>

              {/* Apply buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyToSelected}
                  className="h-8 px-4 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  Apply to Selected ({selectedIds.length})
                </button>
                <button
                  onClick={handleApplyToAllFiltered}
                  className="h-8 px-4 rounded text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
                >
                  Apply to All Filtered ({products.length})
                </button>
              </div>
            </div>
          </div>

          {/* ── Table ───────────────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                Loading products…
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20 text-red-400 text-sm">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                No products found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="accent-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Product / SKU
                      </th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Category
                      </th>
                      <th className="text-right py-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Cost
                      </th>
                      <th className="text-right py-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Current Price
                      </th>
                      <th className="text-right py-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Markup %
                      </th>
                      <th className="text-right py-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-36">
                        New Price
                      </th>
                      <th className="text-right py-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Change %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const row = rows[p.id] ?? { selected: false, newPrice: '' }
                      const newPriceNum = row.newPrice !== '' ? parseFloat(row.newPrice) : NaN
                      const isModified = row.newPrice !== '' && newPriceNum !== p.salePrice
                      const isBelowCost = !isNaN(newPriceNum) && newPriceNum < p.costPrice
                      const changePct = isModified && !isNaN(newPriceNum)
                        ? calcChangePct(p.salePrice, newPriceNum)
                        : null
                      const markupPct = calcMarkupPct(p.costPrice, p.salePrice)

                      return (
                        <tr
                          key={p.id}
                          className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                        >
                          {/* Checkbox */}
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={() => toggleRow(p.id)}
                              className="accent-blue-500 cursor-pointer"
                            />
                          </td>

                          {/* Name + SKU */}
                          <td className="py-2 px-3">
                            <div className="text-sm font-medium text-zinc-100">{p.name}</div>
                            <div className="text-xs font-mono text-zinc-500 mt-0.5">{p.sku}</div>
                          </td>

                          {/* Category */}
                          <td className="py-2 px-3">
                            {p.category ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                                {p.category.name}
                              </span>
                            ) : (
                              <span className="text-zinc-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Cost */}
                          <td className="py-2 px-3 text-right text-sm tabular-nums text-zinc-400">
                            {formatCurrency(p.costPrice)}
                          </td>

                          {/* Current Price */}
                          <td className="py-2 px-3 text-right text-sm tabular-nums font-semibold text-emerald-400">
                            {formatCurrency(p.salePrice)}
                          </td>

                          {/* Markup % */}
                          <td className="py-2 px-3 text-right text-xs tabular-nums text-zinc-400">
                            {markupPct.toFixed(1)}%
                          </td>

                          {/* New Price */}
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.newPrice}
                              onChange={e => setNewPrice(p.id, e.target.value)}
                              placeholder={p.salePrice.toFixed(2)}
                              className={[
                                'h-7 px-2 w-28 rounded text-right text-sm tabular-nums font-semibold',
                                'bg-zinc-900 focus:outline-none transition-colors',
                                isBelowCost
                                  ? 'border border-red-500 text-red-400 focus:border-red-400'
                                  : isModified
                                  ? 'border border-blue-500 text-blue-300 focus:border-blue-400'
                                  : 'border border-zinc-700 text-zinc-200 focus:border-blue-500',
                              ].join(' ')}
                            />
                          </td>

                          {/* Change % */}
                          <td className="py-2 px-3 text-right text-xs tabular-nums">
                            {changePct !== null ? (
                              <span
                                className={[
                                  'inline-flex items-center gap-0.5 font-semibold',
                                  changePct > 0 ? 'text-emerald-400' : changePct < 0 ? 'text-red-400' : 'text-zinc-500',
                                ].join(' ')}
                              >
                                {changePct > 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : changePct < 0 ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : null}
                                {changePct > 0 ? '+' : ''}
                                {changePct.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Footer ──────────────────────────────────────────────── */}
            {!loading && !error && products.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/50 bg-[#0f0f1a]/50">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-500">
                    {products.length} product{products.length !== 1 ? 's' : ''}
                    {selectedIds.length > 0 && (
                      <> · <span className="text-blue-400">{selectedIds.length} selected</span></>
                    )}
                  </span>
                  {modifiedIds.length > 0 && (
                    <span className="text-xs text-amber-400 font-semibold">
                      {modifiedIds.length} unsaved change{modifiedIds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    disabled={modifiedIds.length === 0}
                    className="h-8 px-3 rounded text-xs font-medium bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={modifiedIds.length === 0 || saving}
                    className="h-8 px-4 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving…' : `Save ${modifiedIds.length > 0 ? `(${modifiedIds.length})` : ''}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={[
            'fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl',
            'transition-all duration-200',
            toast.type === 'ok'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/20 border border-red-500/30 text-red-300',
          ].join(' ')}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
