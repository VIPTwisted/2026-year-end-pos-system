'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Download, RefreshCw } from 'lucide-react'

interface SalesSummary {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalItems: number
  totalTax: number
  totalDiscount: number
  netRevenue: number
}

interface PeriodRow {
  period: string
  revenue: number
  orders: number
  avgOrder: number
}

interface TopProduct {
  id: string
  name: string
  sku: string
  units: number
  revenue: number
}

interface TopCustomer {
  id: string
  name: string
  orders: number
  spent: number
}

interface PaymentMethod {
  method: string
  count: number
  amount: number
}

interface SalesReport {
  summary: SalesSummary
  breakdown: PeriodRow[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  paymentMethods: PaymentMethod[]
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonthStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function SalesReportPage() {
  const [from, setFrom] = useState(firstOfMonthStr())
  const [to, setTo] = useState(todayStr())
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runReport = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/reports/sales?from=${from}&to=${to}&groupBy=${groupBy}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load report')
        return r.json() as Promise<SalesReport>
      })
      .then(d => setReport(d))
      .catch(() => setError('Failed to load sales report. Please try again.'))
      .finally(() => setLoading(false))
  }, [from, to, groupBy])

  useEffect(() => { runReport() }, [runReport])

  const totalPayments = report?.paymentMethods.reduce((s, p) => s + p.amount, 0) ?? 0

  return (
    <>
      <TopBar title="Sales Report" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Sales Report</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Revenue, orders, and product performance for a date range</p>
          </div>
          <a
            href={`/api/reports/sales/export?from=${from}&to=${to}`}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </div>

        {/* Filters */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">From</label>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">To</label>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Group By</label>
              <select
                value={groupBy}
                onChange={e => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
            <button
              onClick={runReport}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running...' : 'Run Report'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg px-5 py-4 text-sm text-red-400">{error}</div>
        )}

        {report && (
          <div className="space-y-6">

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">{formatCurrency(report.summary.totalRevenue)}</div>
                <div className="text-xs text-zinc-500 mt-1">{report.summary.totalOrders} orders</div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Avg Order Value</div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">{formatCurrency(report.summary.avgOrderValue)}</div>
                <div className="text-xs text-zinc-500 mt-1">{report.summary.totalItems.toFixed(0)} items sold</div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Net Revenue</div>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(report.summary.netRevenue)}</div>
                <div className="text-xs text-zinc-500 mt-1">After tax {formatCurrency(report.summary.totalTax)}</div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Discount</div>
                <div className="text-2xl font-bold text-amber-400 tabular-nums">{formatCurrency(report.summary.totalDiscount)}</div>
                <div className="text-xs text-zinc-500 mt-1">Given in period</div>
              </div>
            </div>

            {/* Period breakdown */}
            {report.breakdown.length > 0 && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-100">Period Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Orders</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Revenue</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.breakdown.map(row => (
                        <tr key={row.period} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-5 py-3 text-zinc-200 font-mono text-xs">{row.period}</td>
                          <td className="px-5 py-3 text-right text-zinc-200">{row.orders}</td>
                          <td className="px-5 py-3 text-right text-zinc-100 font-semibold tabular-nums">{formatCurrency(row.revenue)}</td>
                          <td className="px-5 py-3 text-right text-zinc-400 tabular-nums">{formatCurrency(row.avgOrder)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-100">Payment Methods</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Method</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Txns</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">% Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.paymentMethods.map(p => (
                      <tr key={p.method} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3 text-zinc-200 capitalize">{p.method.replace('-', ' ')}</td>
                        <td className="px-5 py-3 text-right text-zinc-400">{p.count}</td>
                        <td className="px-5 py-3 text-right text-zinc-100 font-semibold tabular-nums">{formatCurrency(p.amount)}</td>
                        <td className="px-5 py-3 text-right text-zinc-500 tabular-nums">
                          {totalPayments > 0 ? ((p.amount / totalPayments) * 100).toFixed(1) : '0.0'}%
                        </td>
                      </tr>
                    ))}
                    {report.paymentMethods.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-6 text-center text-zinc-500 text-xs">No payment data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Top Products */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-100">Top 10 Products</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Product</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Units</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topProducts.map((p, i) => (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-600 w-4 shrink-0">{i + 1}</span>
                            <div>
                              <div className="text-zinc-200 truncate max-w-[160px]">{p.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">{p.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-zinc-400 tabular-nums">{p.units.toFixed(0)}</td>
                        <td className="px-5 py-3 text-right text-zinc-100 font-semibold tabular-nums">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                    {report.topProducts.length === 0 && (
                      <tr><td colSpan={3} className="px-5 py-6 text-center text-zinc-500 text-xs">No product data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Customers */}
            {report.topCustomers.length > 0 && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-100">Top 10 Customers</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">#</th>
                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Orders</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total Spent</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topCustomers.map((c, i) => (
                        <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-5 py-3 text-zinc-600 text-[11px]">{i + 1}</td>
                          <td className="px-5 py-3 text-zinc-200">{c.name}</td>
                          <td className="px-5 py-3 text-right text-zinc-400">{c.orders}</td>
                          <td className="px-5 py-3 text-right text-zinc-100 font-semibold tabular-nums">{formatCurrency(c.spent)}</td>
                          <td className="px-5 py-3 text-right text-zinc-500 tabular-nums">{formatCurrency(c.orders > 0 ? c.spent / c.orders : 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-20 text-zinc-500 text-sm">Set a date range and click Run Report</div>
        )}
      </main>
    </>
  )
}
