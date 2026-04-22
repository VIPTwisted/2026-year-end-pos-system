'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Download, RefreshCw, Receipt } from 'lucide-react'

interface TaxSummary {
  totalSales: number
  totalTaxCollected: number
  taxableOrders: number
  exemptOrders: number
  netSales: number
}

interface TaxCodeRow {
  code: string
  name: string
  rate: number
  taxableAmount: number
  taxCollected: number
  orderCount: number
}

interface PeriodRow {
  date: string
  sales: number
  tax: number
  orders: number
}

interface ReturnSummary {
  totalRefunded: number
  taxRefunded: number
}

interface TaxReport {
  period: { from: string; to: string }
  summary: TaxSummary
  byTaxCode: TaxCodeRow[]
  byPeriod: PeriodRow[]
  returns: ReturnSummary
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonthStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function lastMonthRange(): { from: string; to: string } {
  const d = new Date()
  const firstThisMonth = new Date(d.getFullYear(), d.getMonth(), 1)
  const lastMonth = new Date(firstThisMonth.getTime() - 1)
  const from = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`
  const to = lastMonth.toISOString().slice(0, 10)
  return { from, to }
}

function thisQuarterRange(): { from: string; to: string } {
  const d = new Date()
  const q = Math.floor(d.getMonth() / 3)
  const from = `${d.getFullYear()}-${String(q * 3 + 1).padStart(2, '0')}-01`
  return { from, to: todayStr() }
}

function ytdRange(): { from: string; to: string } {
  return { from: `${new Date().getFullYear()}-01-01`, to: todayStr() }
}

function fmtMonth(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

function pct(num: number, denom: number): string {
  if (denom === 0) return '0.00%'
  return ((num / denom) * 100).toFixed(2) + '%'
}

export default function SalesTaxReportPage() {
  const [from, setFrom] = useState(firstOfMonthStr())
  const [to, setTo] = useState(todayStr())
  const [report, setReport] = useState<TaxReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const runReport = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/reports/tax?from=${from}&to=${to}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch report')
        return r.json() as Promise<TaxReport>
      })
      .then(setReport)
      .catch(() => setError('Failed to load tax report'))
      .finally(() => setLoading(false))
  }, [from, to])

  useEffect(() => {
    runReport()
  }, [runReport])

  function applyPreset(preset: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'ytd') {
    if (preset === 'thisMonth') {
      setFrom(firstOfMonthStr())
      setTo(todayStr())
    } else if (preset === 'lastMonth') {
      const r = lastMonthRange()
      setFrom(r.from)
      setTo(r.to)
    } else if (preset === 'thisQuarter') {
      const r = thisQuarterRange()
      setFrom(r.from)
      setTo(r.to)
    } else {
      const r = ytdRange()
      setFrom(r.from)
      setTo(r.to)
    }
  }

  function handleExport() {
    setExporting(true)
    const url = `/api/reports/tax/export?from=${from}&to=${to}`
    const a = document.createElement('a')
    a.href = url
    a.download = `tax-report-${from}-to-${to}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setExporting(false), 1500)
  }

  const effectiveRate =
    report && report.summary.totalSales > 0
      ? ((report.summary.totalTaxCollected / report.summary.totalSales) * 100).toFixed(2)
      : '0.00'

  const netTaxLiability =
    report
      ? report.summary.totalTaxCollected - report.returns.taxRefunded
      : 0

  const totalTaxableInTable = report
    ? report.byTaxCode.reduce((s, r) => s + r.taxableAmount, 0)
    : 0
  const totalTaxInTable = report
    ? report.byTaxCode.reduce((s, r) => s + r.taxCollected, 0)
    : 0

  return (
    <>
      <TopBar title="Sales Tax Report" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              Sales Tax Report
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Tax liability by period, code, and order</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || !report}
            className="flex items-center gap-2 px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-zinc-200 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>

        {/* Period controls */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-6">
          {/* Quick period buttons */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mr-1">Period</span>
            {(
              [
                { label: 'This Month', preset: 'thisMonth' },
                { label: 'Last Month', preset: 'lastMonth' },
                { label: 'This Quarter', preset: 'thisQuarter' },
                { label: 'YTD', preset: 'ytd' },
              ] as const
            ).map(({ label, preset }) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded text-[12px] font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom date range */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col justify-end gap-1">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 invisible">Run</div>
              <button
                onClick={runReport}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Run Report
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading && !report && (
          <div className="text-center py-16 text-zinc-500 text-sm">Loading report…</div>
        )}

        {report && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Gross Sales</div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {formatCurrency(report.summary.totalSales)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Before tax</div>
              </div>

              <div className="bg-[#16213e] border border-amber-500/20 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 mb-1">Tax Collected</div>
                <div className="text-2xl font-bold text-amber-400 tabular-nums">
                  {formatCurrency(report.summary.totalTaxCollected)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Total tax remitted</div>
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Taxable Orders</div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {report.summary.taxableOrders.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {report.summary.exemptOrders} exempt
                </div>
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Effective Tax Rate</div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {effectiveRate}%
                </div>
                <div className="text-xs text-zinc-500 mt-1">Tax ÷ gross sales</div>
              </div>
            </div>

            {/* By Tax Code table */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg mb-6 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-[13px] font-semibold text-zinc-100">By Tax Code</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rate %</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Taxable Sales</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Tax Collected</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byTaxCode.map((row) => (
                      <tr key={row.code} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-sm text-zinc-300">{row.code}</td>
                        <td className="px-5 py-3 text-sm text-zinc-200">{row.name}</td>
                        <td className="px-5 py-3 text-sm text-zinc-200 text-right tabular-nums">{row.rate.toFixed(2)}%</td>
                        <td className="px-5 py-3 text-sm text-zinc-200 text-right tabular-nums">{formatCurrency(row.taxableAmount)}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-amber-400 text-right tabular-nums">{formatCurrency(row.taxCollected)}</td>
                        <td className="px-5 py-3 text-sm text-zinc-400 text-right tabular-nums">{row.orderCount}</td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-zinc-800/30 border-t border-zinc-700">
                      <td className="px-5 py-3 text-sm font-semibold text-zinc-200" colSpan={3}>Totals</td>
                      <td className="px-5 py-3 text-sm font-semibold text-zinc-200 text-right tabular-nums">{formatCurrency(totalTaxableInTable)}</td>
                      <td className="px-5 py-3 text-sm font-bold text-amber-400 text-right tabular-nums">{formatCurrency(totalTaxInTable)}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-zinc-200 text-right tabular-nums">
                        {report.byTaxCode.reduce((s, r) => s + r.orderCount, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly breakdown table */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg mb-6 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-[13px] font-semibold text-zinc-100">Monthly Breakdown</h2>
              </div>
              {report.byPeriod.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-zinc-500">No data for selected period</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Month</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Gross Sales</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Tax Collected</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Orders</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Effective Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.byPeriod.map((row) => (
                        <tr key={row.date} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="px-5 py-3 text-sm text-zinc-200">{fmtMonth(row.date)}</td>
                          <td className="px-5 py-3 text-sm text-zinc-200 text-right tabular-nums">{formatCurrency(row.sales)}</td>
                          <td className="px-5 py-3 text-sm font-semibold text-amber-400 text-right tabular-nums">{formatCurrency(row.tax)}</td>
                          <td className="px-5 py-3 text-sm text-zinc-400 text-right tabular-nums">{row.orders}</td>
                          <td className="px-5 py-3 text-sm text-zinc-400 text-right tabular-nums">{pct(row.tax, row.sales)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Returns / Refunds + Net Liability */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Returns & Refunds</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Total Refunded</span>
                    <span className="text-sm font-semibold text-red-400 tabular-nums">
                      {formatCurrency(report.returns.totalRefunded)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Tax Refunded</span>
                    <span className="text-sm font-semibold text-red-400 tabular-nums">
                      {formatCurrency(report.returns.taxRefunded)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                    <span className="text-sm text-zinc-200 font-medium">Net Sales</span>
                    <span className="text-sm font-bold text-zinc-100 tabular-nums">
                      {formatCurrency(report.summary.netSales)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#16213e] border border-amber-500/20 rounded-lg p-5 flex flex-col justify-between">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 mb-2">Net Tax Liability</h2>
                <div>
                  <div className="text-3xl font-bold text-amber-400 tabular-nums mb-1">
                    {formatCurrency(netTaxLiability)}
                  </div>
                  <div className="text-xs text-zinc-500">Tax Collected − Tax Refunded</div>
                  <div className="mt-3 text-[11px] text-zinc-600">
                    {formatCurrency(report.summary.totalTaxCollected)} collected &minus; {formatCurrency(report.returns.taxRefunded)} refunded
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-5 py-3 text-[12px] text-amber-600/80">
              This report is for informational purposes only. Consult your tax advisor before filing.
            </div>
          </>
        )}
      </main>
    </>
  )
}
