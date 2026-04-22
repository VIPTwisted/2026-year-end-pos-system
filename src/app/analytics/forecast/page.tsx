'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Layers, AlertTriangle, PackageSearch, ShoppingCart, RefreshCw, Download } from 'lucide-react'

interface WeeklyBucket {
  week: string
  unitsSold: number
}

interface ForecastProduct {
  productId: string
  name: string
  sku: string
  category: string
  currentQty: number
  avgWeeklyDemand: number
  forecastedDemand: number
  daysOfStock: number
  recommendedOrderQty: number
  urgencyLevel: 'critical' | 'low' | 'medium' | 'healthy'
  weeklyHistory: WeeklyBucket[]
}

interface ForecastSummary {
  criticalCount: number
  totalRecommendedSpend: number
  productsForecasted: number
}

interface ForecastResponse {
  generatedAt: string
  forecastPeriod: number
  products: ForecastProduct[]
  summary: ForecastSummary
}

const URGENCY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
  low: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  healthy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
}

const PERIOD_OPTIONS = [
  { label: '2 Weeks', value: 2 },
  { label: '4 Weeks', value: 4 },
  { label: '8 Weeks', value: 8 },
  { label: '12 Weeks', value: 12 },
]

export default function DemandForecastPage() {
  const [periods, setPeriods] = useState(4)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ForecastResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runForecast() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/analytics/forecast?periods=${periods}`)
      if (!res.ok) throw new Error('Forecast failed')
      const json = (await res.json()) as ForecastResponse
      setData(json)
    } catch {
      setError('Failed to generate forecast. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Only show products where recommendedOrderQty > 0
  const displayProducts = data
    ? data.products.filter(p => p.recommendedOrderQty > 0)
    : []

  const outIn7Days = data
    ? data.products.filter(p => p.daysOfStock < 7 && p.daysOfStock < 999).length
    : 0

  return (
    <>
      <TopBar title="Demand Forecast" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Demand Forecast</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Exponential smoothing on 12-week sales history — identify reorder needs before stockouts
            </p>
          </div>
          {data && (
            <a
              href={`/api/analytics/forecast/export?periods=${periods}`}
              download
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </a>
          )}
        </div>

        {/* Controls */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                Forecast Period
              </div>
              <div className="flex gap-2">
                {PERIOD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriods(opt.value)}
                    className={`px-3 py-1.5 rounded text-[12px] font-medium border transition-colors ${
                      periods === opt.value
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runForecast}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running…' : 'Run Forecast'}
            </button>

            {data && (
              <span className="text-[11px] text-zinc-500 ml-auto">
                Generated {new Date(data.generatedAt).toLocaleString()} · {data.forecastPeriod}-week horizon
              </span>
            )}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Products Forecasted
                  </span>
                </div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {data.summary.productsForecasted}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {displayProducts.length} need reorder
                </div>
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Critical Items
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-400 tabular-nums">
                  {data.summary.criticalCount}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Stock out within 7 days
                </div>
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Recommended Order Spend
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(data.summary.totalRecommendedSpend)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Based on sale prices
                </div>
              </div>
            </div>

            {/* Insight callouts */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-[13px] text-zinc-300">
                  <span className="font-semibold text-red-400">{outIn7Days} product{outIn7Days !== 1 ? 's' : ''}</span>
                  {' '}will be out of stock within 7 days
                </span>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-[13px] text-zinc-300">
                  Recommended this week&apos;s PO:{' '}
                  <span className="font-semibold text-emerald-400">{formatCurrency(data.summary.totalRecommendedSpend)}</span>
                </span>
              </div>
            </div>

            {/* Product table */}
            {displayProducts.length === 0 ? (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-10 text-center">
                <PackageSearch className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <div className="text-[13px] text-zinc-500">
                  No products require reorder for the selected forecast period.
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">
                    Reorder Required — {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''}
                  </span>
                  <a
                    href="/inventory/reorder"
                    className="flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Generate Purchase Orders →
                  </a>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-[#0f0f1a]">
                        {[
                          'Product Name',
                          'SKU',
                          'Category',
                          'Current Qty',
                          'Avg Wkly Demand',
                          'Forecasted Demand',
                          'Rec. Order Qty',
                          'Days of Stock',
                          'Urgency',
                        ].map(h => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {displayProducts.map(product => (
                        <tr
                          key={product.productId}
                          className="bg-[#16213e] hover:bg-[#1a2847] transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-zinc-100 font-medium max-w-[200px] truncate">
                            {product.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-400 text-[12px]">
                            {product.sku}
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-[12px]">
                            {product.category}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-zinc-200 text-[13px]">
                            {product.currentQty.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-zinc-400 text-[13px]">
                            {product.avgWeeklyDemand.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-zinc-200 text-[13px] font-medium">
                            {product.forecastedDemand.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-blue-400 text-[13px] font-semibold">
                            {product.recommendedOrderQty.toFixed(0)}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-[13px]">
                            <span
                              className={
                                product.daysOfStock >= 999
                                  ? 'text-zinc-500'
                                  : product.daysOfStock < 7
                                  ? 'text-red-400 font-semibold'
                                  : product.daysOfStock < 14
                                  ? 'text-amber-400'
                                  : 'text-zinc-300'
                              }
                            >
                              {product.daysOfStock >= 999 ? '∞' : product.daysOfStock.toFixed(0)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${URGENCY_STYLES[product.urgencyLevel]}`}
                            >
                              {product.urgencyLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {!data && !loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <div className="text-[14px] text-zinc-400 font-medium mb-1">No forecast generated yet</div>
            <div className="text-[12px] text-zinc-600">
              Select a forecast period above and click <span className="text-zinc-500">Run Forecast</span> to analyze demand
            </div>
          </div>
        )}

      </main>
    </>
  )
}
