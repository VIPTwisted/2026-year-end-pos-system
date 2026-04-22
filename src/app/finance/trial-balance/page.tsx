'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { BarChart3, Download, RefreshCw, X } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TBRow {
  id: string
  period: string
  accountCode: string
  accountName: string
  accountType: string
  openingDebit: number
  openingCredit: number
  periodDebit: number
  periodCredit: number
  closingDebit: number
  closingCredit: number
  generatedAt: string
}

interface GrandTotals {
  openingDebit: number
  openingCredit: number
  periodDebit: number
  periodCredit: number
  closingDebit: number
  closingCredit: number
}

interface TBResponse {
  period: string
  rows: TBRow[]
  grandTotals: GrandTotals
  availablePeriods: string[]
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function isBalanced(totals: GrandTotals): boolean {
  return Math.abs(totals.closingDebit - totals.closingCredit) < 0.01
}

function downloadCSV(rows: TBRow[], period: string) {
  const headers = [
    'Account Code', 'Account Name', 'Account Type',
    'Opening Debit', 'Opening Credit',
    'Period Debit', 'Period Credit',
    'Closing Debit', 'Closing Credit',
  ]
  const lines = rows.map(r => [
    r.accountCode, `"${r.accountName}"`, r.accountType,
    r.openingDebit.toFixed(2), r.openingCredit.toFixed(2),
    r.periodDebit.toFixed(2), r.periodCredit.toFixed(2),
    r.closingDebit.toFixed(2), r.closingCredit.toFixed(2),
  ].join(','))
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trial-balance-${period}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TrialBalancePage() {
  const [data, setData] = useState<TBResponse | null>(null)
  const [period, setPeriod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)

  const load = useCallback((p?: string) => {
    setLoading(true)
    setError(null)
    const url = p ? `/api/finance/trial-balance-register?period=${encodeURIComponent(p)}` : '/api/finance/trial-balance-register'
    fetch(url)
      .then(r => r.json())
      .then((d: TBResponse | { error: string }) => {
        if ('error' in d) { setError(d.error); setData(null) }
        else setData(d)
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setPeriod(val)
    load(val || undefined)
  }

  const grouped = data?.rows.reduce((acc, row) => {
    const t = row.accountType || 'Other'
    if (!acc[t]) acc[t] = []
    acc[t].push(row)
    return acc
  }, {} as Record<string, TBRow[]>) ?? {}

  const balanced = data ? isBalanced(data.grandTotals) : false

  return (
    <>
      <TopBar
        title="Trial Balance"
        actions={
          data && data.rows.length > 0 ? (
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          ) : undefined
        }
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Finance</p>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Trial Balance
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Account balances by fiscal period</p>
            </div>
            <Link
              href="/finance/gl/trial-balance"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              View GL-based trial balance →
            </Link>
          </div>

          {/* Filter bar */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                Fiscal Period
              </label>
              <select
                value={period}
                onChange={handlePeriodChange}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">All periods</option>
                {data?.availablePeriods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => load(period || undefined)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Balance status */}
          {data && (
            <div className={`px-5 py-3 rounded-lg border text-sm font-medium flex items-center justify-between ${
              balanced
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <span>
                {balanced
                  ? `Balanced — ${data.period === 'all' ? 'All periods' : `Period ${data.period}`}`
                  : `Out of balance by ${fmt(Math.abs(data.grandTotals.closingDebit - data.grandTotals.closingCredit))}`}
              </span>
              <span className="text-[11px] opacity-70">{data.rows.length} accounts</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-5 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !data && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && data && data.rows.length === 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
              <BarChart3 className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No trial balance data for this period.</p>
              <p className="text-xs text-zinc-600 mt-1">Generate a trial balance snapshot from the GL module first.</p>
            </div>
          )}

          {/* Grouped tables */}
          {data && data.rows.length > 0 && (
            <div className="space-y-6">
              {Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([type, rows]) => {
                  const sub = rows.reduce(
                    (acc, r) => ({
                      openingDebit: acc.openingDebit + r.openingDebit,
                      openingCredit: acc.openingCredit + r.openingCredit,
                      periodDebit: acc.periodDebit + r.periodDebit,
                      periodCredit: acc.periodCredit + r.periodCredit,
                      closingDebit: acc.closingDebit + r.closingDebit,
                      closingCredit: acc.closingCredit + r.closingCredit,
                    }),
                    { openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 0, closingDebit: 0, closingCredit: 0 }
                  )
                  return (
                    <div key={type}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">{type}</p>
                      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-zinc-800/60">
                              <tr>
                                {[
                                  { h: 'Code', cls: 'text-left w-28' },
                                  { h: 'Account', cls: 'text-left' },
                                  { h: 'Opening Dr', cls: 'text-right' },
                                  { h: 'Opening Cr', cls: 'text-right' },
                                  { h: 'Period Dr', cls: 'text-right' },
                                  { h: 'Period Cr', cls: 'text-right' },
                                  { h: 'Closing Dr', cls: 'text-right' },
                                  { h: 'Closing Cr', cls: 'text-right' },
                                ].map(({ h, cls }) => (
                                  <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${cls}`}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40">
                              {rows.map(r => (
                                <tr key={r.id} className="hover:bg-zinc-800/20 transition-colors">
                                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{r.accountCode}</td>
                                  <td className="px-4 py-2.5 text-zinc-200">{r.accountName}</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-zinc-400">
                                    {r.openingDebit > 0 ? fmt(r.openingDebit) : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-zinc-400">
                                    {r.openingCredit > 0 ? fmt(r.openingCredit) : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-blue-400">
                                    {r.periodDebit > 0 ? fmt(r.periodDebit) : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-blue-400">
                                    {r.periodCredit > 0 ? fmt(r.periodCredit) : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums font-semibold text-zinc-100">
                                    {r.closingDebit > 0 ? fmt(r.closingDebit) : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums font-semibold text-zinc-100">
                                    {r.closingCredit > 0 ? fmt(r.closingCredit) : '—'}
                                  </td>
                                </tr>
                              ))}
                              {/* Subtotal row */}
                              <tr className="bg-zinc-900/40 border-t border-zinc-700/50">
                                <td colSpan={2} className="px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
                                  {type} Subtotal
                                </td>
                                <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-zinc-300">{fmt(sub.openingDebit)}</td>
                                <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-zinc-300">{fmt(sub.openingCredit)}</td>
                                <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-zinc-300">{fmt(sub.periodDebit)}</td>
                                <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-zinc-300">{fmt(sub.periodCredit)}</td>
                                <td className="px-4 py-2 text-right font-mono text-xs tabular-nums font-bold text-zinc-100">{fmt(sub.closingDebit)}</td>
                                <td className="px-4 py-2 text-right font-mono text-xs tabular-nums font-bold text-zinc-100">{fmt(sub.closingCredit)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* Grand totals */}
              <div className="bg-[#16213e] border border-zinc-700/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="bg-zinc-900/60">
                        <td colSpan={2} className="px-4 py-3 text-sm font-bold text-zinc-100 uppercase tracking-widest">
                          Grand Totals
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-zinc-100">
                          {fmt(data.grandTotals.openingDebit)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-zinc-100">
                          {fmt(data.grandTotals.openingCredit)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-blue-300">
                          {fmt(data.grandTotals.periodDebit)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-blue-300">
                          {fmt(data.grandTotals.periodCredit)}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono tabular-nums font-bold text-lg ${balanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {fmt(data.grandTotals.closingDebit)}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono tabular-nums font-bold text-lg ${balanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {fmt(data.grandTotals.closingCredit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CSV Export Modal */}
      {showExportModal && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-100">Export Trial Balance</h3>
              <button onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-1">
              Period: <span className="text-zinc-200 font-medium">{data.period === 'all' ? 'All Periods' : data.period}</span>
            </p>
            <p className="text-sm text-zinc-400 mb-6">
              {data.rows.length} accounts · {balanced ? 'Balanced' : 'Out of balance'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  downloadCSV(data.rows, data.period)
                  setShowExportModal(false)
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
