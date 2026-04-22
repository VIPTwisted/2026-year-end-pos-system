'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, AlertTriangle, Download } from 'lucide-react'

interface ProductRow {
  id: string
  name: string
  sku: string
  category: string
  unitsSold: number
  revenue: number
  cogs: number
  grossProfit: number
  marginPct: number
  avgSellPrice: number
  currentStock: number
}

interface Summary {
  totalRevenue: number
  totalCOGS: number
  totalGrossProfit: number
  avgMarginPct: number
  bestMarginProduct: string
  worstMarginProduct: string
}

interface ProfitabilityData {
  products: ProductRow[]
  summary: Summary
}

interface Category {
  id: string
  name: string
  slug: string
}

type SortKey = keyof ProductRow
type SortDir = 'asc' | 'desc'

function getMonthRange(): { from: string; to: string } {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { from: fmt(from), to: fmt(to) }
}

function MarginBadge({ pct }: { pct: number }) {
  const label = `${pct.toFixed(1)}%`
  if (pct >= 40)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
        {label}
      </span>
    )
  if (pct >= 20)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400">
        {label}
      </span>
    )
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">
      {label}
    </span>
  )
}

export default function ProfitabilityPage() {
  const defaultRange = getMonthRange()
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [data, setData] = useState<ProfitabilityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('grossProfit')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    fetch('/api/products/categories')
      .then((r) => r.json())
      .then((d: Category[]) => setCategories(d))
      .catch(() => notify('Failed to load categories', 'err'))
  }, [])

  const runAnalysis = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from, to })
    if (categoryId) params.set('categoryId', categoryId)
    fetch(`/api/analytics/profitability?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch profitability data')
        return r.json() as Promise<ProfitabilityData>
      })
      .then((d) => setData(d))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load data'
        setError(msg)
        notify(msg, 'err')
      })
      .finally(() => setLoading(false))
  }, [from, to, categoryId])

  // Run on mount with default range
  useEffect(() => {
    runAnalysis()
  }, [runAnalysis])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = data
    ? [...data.products].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
    : []

  const belowCost = sorted.filter((p) => p.marginPct < 0)

  const exportUrl = (() => {
    const params = new URLSearchParams({ from, to })
    if (categoryId) params.set('categoryId', categoryId)
    return `/api/analytics/profitability/export?${params}`
  })()

  const SortHeader = ({
    label,
    col,
    align = 'left',
  }: {
    label: string
    col: SortKey
    align?: 'left' | 'right'
  }) => (
    <th
      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(col)}
    >
      {label}
      {sortKey === col && (
        <span className="ml-1 text-blue-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  )

  return (
    <>
      <TopBar title="Product Profitability" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border ${
              toast.type === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Product Profitability</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Margin analysis by product for any date range</p>
          </div>
          <a
            href={exportUrl}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
        </div>

        {/* Filters */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Summary cards */}
        {data && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  Total Revenue
                </div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {formatCurrency(data.summary.totalRevenue)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">From completed orders</div>
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  Total COGS
                </div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {formatCurrency(data.summary.totalCOGS)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Cost of goods sold</div>
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  Gross Profit
                </div>
                <div
                  className={`text-2xl font-bold tabular-nums ${
                    data.summary.totalGrossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(data.summary.totalGrossProfit)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Revenue minus COGS</div>
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  Avg Margin
                </div>
                <div
                  className={`text-2xl font-bold tabular-nums ${
                    data.summary.avgMarginPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {data.summary.avgMarginPct.toFixed(1)}%
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Best: {data.summary.bestMarginProduct || '—'}
                </div>
              </div>
            </div>

            {/* Below-cost alert */}
            {belowCost.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">
                    {belowCost.length} product{belowCost.length > 1 ? 's' : ''} sold below cost
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {belowCost.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-xs"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-red-500">({p.marginPct.toFixed(1)}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
              <table className="w-full">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <SortHeader label="Product" col="name" />
                    <SortHeader label="SKU" col="sku" />
                    <SortHeader label="Category" col="category" />
                    <SortHeader label="Units Sold" col="unitsSold" align="right" />
                    <SortHeader label="Revenue" col="revenue" align="right" />
                    <SortHeader label="COGS" col="cogs" align="right" />
                    <SortHeader label="Gross Profit" col="grossProfit" align="right" />
                    <SortHeader label="Margin %" col="marginPct" align="right" />
                    <SortHeader label="Avg Sell Price" col="avgSellPrice" align="right" />
                    <SortHeader label="Stock" col="currentStock" align="right" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-zinc-500 text-sm">
                        No sales data found for this period
                      </td>
                    </tr>
                  )}
                  {sorted.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-t border-zinc-800 ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}
                    >
                      <td className="px-4 py-3 text-sm text-zinc-100 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-zinc-400 text-sm">{p.sku}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{p.category}</td>
                      <td className="px-4 py-3 text-sm text-zinc-200 text-right tabular-nums">
                        {p.unitsSold.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-200 text-right tabular-nums font-semibold">
                        {formatCurrency(p.revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 text-right tabular-nums">
                        {formatCurrency(p.cogs)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm text-right tabular-nums font-semibold ${
                          p.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {formatCurrency(p.grossProfit)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MarginBadge pct={p.marginPct} />
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 text-right tabular-nums">
                        {formatCurrency(p.avgSellPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 text-right tabular-nums">
                        {p.currentStock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer stats */}
            {sorted.length > 0 && (
              <div className="mt-3 flex items-center gap-6 text-xs text-zinc-500">
                <span>{sorted.length} products</span>
                <span>Best margin: <span className="text-emerald-400">{data.summary.bestMarginProduct}</span></span>
                <span>Worst margin: <span className="text-red-400">{data.summary.worstMarginProduct}</span></span>
              </div>
            )}
          </>
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <TrendingUp className="w-8 h-8 text-zinc-700 animate-pulse" />
              <p className="text-zinc-500 text-sm">Running margin analysis...</p>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
