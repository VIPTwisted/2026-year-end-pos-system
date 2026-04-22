'use client'

import { useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'

interface ExpenseLine {
  accountCode: string
  accountName: string
  amount: number
}

interface PLStatement {
  period: { from: string; to: string }
  revenue: { salesRevenue: number; otherRevenue: number; totalRevenue: number }
  costOfGoods: { cogs: number; totalCOGS: number }
  grossProfit: number
  expenses: ExpenseLine[]
  totalExpenses: number
  operatingIncome: number
  netIncome: number
}

const PRESETS = [
  { label: 'This Month', getRange: () => {
    const now = new Date()
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    }
  }},
  { label: 'Last Month', getRange: () => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const last  = new Date(now.getFullYear(), now.getMonth(), 0)
    return {
      from: first.toISOString().slice(0, 10),
      to:   last.toISOString().slice(0, 10),
    }
  }},
  { label: 'Last Quarter', getRange: () => {
    const now = new Date()
    const q = Math.floor(now.getMonth() / 3)
    const startMonth = (q - 1) * 3
    const first = new Date(q === 0 ? now.getFullYear() - 1 : now.getFullYear(), q === 0 ? 9 : startMonth, 1)
    const last  = new Date(first.getFullYear(), first.getMonth() + 3, 0)
    return {
      from: first.toISOString().slice(0, 10),
      to:   last.toISOString().slice(0, 10),
    }
  }},
  { label: 'Last Year', getRange: () => {
    const y = new Date().getFullYear() - 1
    return { from: `${y}-01-01`, to: `${y}-12-31` }
  }},
  { label: 'YTD', getRange: () => {
    const now = new Date()
    return { from: `${now.getFullYear()}-01-01`, to: now.toISOString().slice(0, 10) }
  }},
]

function today() { return new Date().toISOString().slice(0, 10) }
function firstOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

export default function PLStatementPage() {
  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo]   = useState(today())
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [data, setData]       = useState<PLStatement | null>(null)

  const generate = useCallback(async (f = from, t = to) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/finance/pl-statement?from=${f}&to=${t}`)
      if (!res.ok) throw new Error('Failed to fetch P&L statement')
      const json = await res.json() as PLStatement
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  function applyPreset(preset: typeof PRESETS[number]) {
    const range = preset.getRange()
    setFrom(range.from)
    setTo(range.to)
    generate(range.from, range.to)
  }

  const fmt = (n: number) => formatCurrency(n)

  return (
    <>
      <TopBar title="P&L Statement" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Profit &amp; Loss Statement</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Income, COGS, and expense summary for a date range</p>
        </div>

        {/* Controls */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => generate()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-1.5 rounded transition-colors"
            >
              {loading ? 'Generating…' : 'Generate'}
            </button>
            <div className="flex flex-wrap gap-2 ml-auto">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="text-[11px] px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {!data && !loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-24 text-zinc-500">
            <p className="text-[13px]">Select a date range and click Generate</p>
          </div>
        )}

        {loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-24 text-zinc-500">
            <p className="text-[13px]">Generating statement…</p>
          </div>
        )}

        {data && !loading && (
          <div id="pl-print-area" className="space-y-4">

            {/* Statement header */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Profit &amp; Loss Statement</h2>
                <p className="text-[13px] text-zinc-500 mt-0.5">
                  Period: {data.period.from} &ndash; {data.period.to}
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="text-[12px] px-4 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors print:hidden"
              >
                Print
              </button>
            </div>

            {/* REVENUE */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Revenue</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                    <td className="px-5 py-2.5 text-zinc-300">Sales Revenue</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-zinc-200 font-medium">{fmt(data.revenue.salesRevenue)}</td>
                  </tr>
                  {data.revenue.otherRevenue !== 0 && (
                    <tr className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                      <td className="px-5 py-2.5 text-zinc-300">Other Revenue (GL)</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-zinc-200 font-medium">{fmt(data.revenue.otherRevenue)}</td>
                    </tr>
                  )}
                  <tr className="bg-zinc-900/30">
                    <td className="px-5 py-2.5 font-semibold text-zinc-100">Total Revenue</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-bold text-emerald-400 text-base">{fmt(data.revenue.totalRevenue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* COST OF GOODS SOLD */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Cost of Goods Sold</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                    <td className="px-5 py-2.5 text-zinc-300">Cost of Goods Sold</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-zinc-200 font-medium">{fmt(data.costOfGoods.cogs)}</td>
                  </tr>
                  <tr className="bg-zinc-900/30">
                    <td className="px-5 py-2.5 font-semibold text-zinc-100">Total COGS</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-bold text-amber-400 text-base">{fmt(data.costOfGoods.totalCOGS)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GROSS PROFIT */}
            <div className={`rounded-lg border px-6 py-4 flex items-center justify-between ${
              data.grossProfit >= 0
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <span className="text-base font-bold text-zinc-100">Gross Profit</span>
              <span className={`text-2xl font-bold tabular-nums ${data.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(data.grossProfit)}
              </span>
            </div>

            {/* OPERATING EXPENSES */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-400">Operating Expenses</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {data.expenses.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-5 py-4 text-center text-zinc-600 text-[13px]">No expense entries in this period</td>
                    </tr>
                  ) : (
                    data.expenses.map((exp, i) => (
                      <tr key={exp.accountCode} className={`hover:bg-zinc-800/20 ${i < data.expenses.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                        <td className="px-5 py-2.5 text-zinc-300">
                          <span className="font-mono text-[11px] text-zinc-600 mr-2">{exp.accountCode}</span>
                          {exp.accountName}
                        </td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-zinc-200 font-medium">{fmt(exp.amount)}</td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-zinc-900/30 border-t border-zinc-800/60">
                    <td className="px-5 py-2.5 font-semibold text-zinc-100">Total Expenses</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-bold text-rose-400 text-base">{fmt(data.totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* OPERATING INCOME */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-6 py-3 flex items-center justify-between">
              <span className="font-bold text-zinc-100">Operating Income</span>
              <span className={`text-lg font-bold tabular-nums ${data.operatingIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(data.operatingIncome)}
              </span>
            </div>

            {/* NET INCOME */}
            <div className={`rounded-lg border px-6 py-5 flex items-center justify-between ${
              data.netIncome >= 0
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <span className="text-xl font-bold text-zinc-100">Net Income</span>
              <span className={`text-3xl font-extrabold tabular-nums ${data.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(data.netIncome)}
              </span>
            </div>

          </div>
        )}

      </main>
    </>
  )
}
