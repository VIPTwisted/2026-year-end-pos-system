'use client'
import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type Period = 'today' | 'week' | 'month' | 'year'

interface StoreMetrics {
  revenue: number
  orders: number
  avgOrderValue: number
  totalInventoryValue: number
  lowStockCount: number
  activeShift: boolean
  employeeCount: number
}

interface StoreRow {
  id: string
  name: string
  address: string
  isActive: boolean
  metrics: StoreMetrics
}

interface ComparisonData {
  stores: StoreRow[]
  period: Period
  totals: { revenue: number; orders: number }
}

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
}

export default function StoreComparisonPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((p: Period) => {
    setLoading(true)
    setError(null)
    fetch(`/api/stores/comparison?period=${p}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load comparison data')
        return r.json() as Promise<ComparisonData>
      })
      .then(d => setData(d))
      .catch(() => setError('Failed to load store comparison data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(period)
  }, [period, load])

  const sorted = data
    ? [...data.stores].sort((a, b) => b.metrics.revenue - a.metrics.revenue)
    : []

  const topId = sorted[0]?.id ?? null

  return (
    <>
      <TopBar
        title="Store Comparison"
        breadcrumb={[{ label: 'Stores', href: '/stores' }]}
        actions={
          <Link
            href="/stores"
            className="text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Back to Stores
          </Link>
        }
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Period selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 mr-2">Period</span>
            {(['today', 'week', 'month', 'year'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          {/* Totals row */}
          {data && !loading && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  Total Revenue — {PERIOD_LABELS[period]}
                </div>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(data.totals.revenue)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  across {data.stores.length} store{data.stores.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  Total Orders — {PERIOD_LABELS[period]}
                </div>
                <div className="text-2xl font-bold text-blue-400 tabular-nums">
                  {data.totals.orders.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  combined across all locations
                </div>
              </div>
            </div>
          )}

          {/* Loading / Error */}
          {loading && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-16">
              <span className="text-sm text-zinc-500">Loading comparison data…</span>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-5 py-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Comparison table */}
          {!loading && !error && data && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Comparison — {PERIOD_LABELS[period]}
                </span>
                <span className="text-[11px] text-zinc-600">Sorted by revenue</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      {[
                        { label: 'Store', align: 'text-left' },
                        { label: 'Revenue', align: 'text-right' },
                        { label: 'Share', align: 'text-center' },
                        { label: 'Orders', align: 'text-right' },
                        { label: 'Avg Order', align: 'text-right' },
                        { label: 'Inv. Value', align: 'text-right' },
                        { label: 'Low Stock', align: 'text-right' },
                        { label: 'Shift', align: 'text-center' },
                        { label: 'Staff', align: 'text-right' },
                      ].map(h => (
                        <th
                          key={h.label}
                          className={`px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${h.align}`}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {sorted.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-sm text-zinc-600">
                          No stores found
                        </td>
                      </tr>
                    ) : (
                      sorted.map(store => {
                        const sharePct =
                          data.totals.revenue > 0
                            ? (store.metrics.revenue / data.totals.revenue) * 100
                            : 0
                        const isTop = store.id === topId && store.metrics.revenue > 0

                        return (
                          <tr
                            key={store.id}
                            className="hover:bg-zinc-800/30 transition-colors"
                          >
                            {/* Store name */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/stores/${store.id}`}
                                  className="text-[13px] font-medium text-zinc-100 hover:text-emerald-400 transition-colors"
                                >
                                  {store.name}
                                </Link>
                                {isTop && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                    TOP
                                  </span>
                                )}
                                {!store.isActive && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-700/60 text-zinc-500">
                                    INACTIVE
                                  </span>
                                )}
                              </div>
                              {store.address && (
                                <p className="text-[11px] text-zinc-600 mt-0.5 truncate max-w-[200px]">
                                  {store.address}
                                </p>
                              )}
                            </td>

                            {/* Revenue */}
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`text-[13px] tabular-nums font-semibold ${
                                  isTop ? 'text-emerald-400' : 'text-zinc-200'
                                }`}
                              >
                                {formatCurrency(store.metrics.revenue)}
                              </span>
                            </td>

                            {/* Revenue share bar */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 min-w-[100px]">
                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, sharePct)}%` }}
                                  />
                                </div>
                                <span className="text-[11px] text-zinc-500 tabular-nums w-9 text-right shrink-0">
                                  {sharePct.toFixed(0)}%
                                </span>
                              </div>
                            </td>

                            {/* Orders */}
                            <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">
                              {store.metrics.orders.toLocaleString()}
                            </td>

                            {/* Avg order */}
                            <td className="px-4 py-3 text-right text-[13px] text-zinc-400 tabular-nums">
                              {store.metrics.orders > 0
                                ? formatCurrency(store.metrics.avgOrderValue)
                                : '—'}
                            </td>

                            {/* Inventory value */}
                            <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">
                              {formatCurrency(store.metrics.totalInventoryValue)}
                            </td>

                            {/* Low stock */}
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`text-[13px] tabular-nums font-medium ${
                                  store.metrics.lowStockCount > 0
                                    ? 'text-amber-400'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {store.metrics.lowStockCount}
                              </span>
                            </td>

                            {/* Shift status */}
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                                  store.metrics.activeShift
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-zinc-700/40 text-zinc-500'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    store.metrics.activeShift ? 'bg-emerald-400' : 'bg-zinc-600'
                                  }`}
                                />
                                {store.metrics.activeShift ? 'Open' : 'Closed'}
                              </span>
                            </td>

                            {/* Staff */}
                            <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">
                              {store.metrics.employeeCount}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
