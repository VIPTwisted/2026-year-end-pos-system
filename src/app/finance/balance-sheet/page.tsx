'use client'

import { useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'

interface AccountBalance {
  code: string
  name: string
  balance: number
}

interface BalanceSheet {
  asOf: string
  assets: {
    current: AccountBalance[]
    fixed: AccountBalance[]
    totalAssets: number
  }
  liabilities: {
    current: AccountBalance[]
    longTerm: AccountBalance[]
    totalLiabilities: number
  }
  equity: {
    accounts: AccountBalance[]
    retainedEarnings: number
    totalEquity: number
  }
  totalLiabilitiesAndEquity: number
}

function today() { return new Date().toISOString().slice(0, 10) }
function fmt(n: number) { return formatCurrency(n) }

function AccountTable({ accounts, emptyLabel }: { accounts: AccountBalance[]; emptyLabel: string }) {
  if (accounts.length === 0) {
    return <p className="text-[12px] text-zinc-600 py-2">{emptyLabel}</p>
  }
  return (
    <table className="w-full text-sm">
      <tbody>
        {accounts.map((a, i) => (
          <tr key={a.code} className={`hover:bg-zinc-800/20 ${i < accounts.length - 1 ? 'border-b border-zinc-800/30' : ''}`}>
            <td className="py-1.5">
              <span className="font-mono text-[10px] text-zinc-600 mr-2">{a.code}</span>
              <span className="text-zinc-300">{a.name}</span>
            </td>
            <td className="py-1.5 text-right tabular-nums text-zinc-200 font-medium whitespace-nowrap">{fmt(a.balance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${color}`}>{label}</div>
  )
}

function Subtotal({ label, value, large = false }: { label: string; value: number; large?: boolean }) {
  return (
    <div className={`flex items-center justify-between border-t border-zinc-700/60 pt-2 mt-2 ${large ? 'mt-3 pt-3' : ''}`}>
      <span className={`font-semibold text-zinc-100 ${large ? 'text-base' : 'text-sm'}`}>{label}</span>
      <span className={`tabular-nums font-bold ${large ? 'text-lg text-blue-400' : 'text-sm text-zinc-200'}`}>{fmt(value)}</span>
    </div>
  )
}

export default function BalanceSheetPage() {
  const [asOf, setAsOf]     = useState(today())
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [data, setData]       = useState<BalanceSheet | null>(null)

  const generate = useCallback(async (d = asOf) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/finance/balance-sheet?asOf=${d}`)
      if (!res.ok) throw new Error('Failed to fetch balance sheet')
      const json = await res.json() as BalanceSheet
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [asOf])

  const isBalanced = data
    ? Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
    : null

  return (
    <>
      <TopBar title="Balance Sheet" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Balance Sheet</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Assets, liabilities, and equity as of a specific date</p>
        </div>

        {/* Controls */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">As of Date</label>
              <input
                type="date"
                value={asOf}
                onChange={e => setAsOf(e.target.value)}
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
            <div className="flex gap-2 ml-auto">
              {[
                { label: 'Today', value: today() },
                { label: 'Month End', value: (() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 0).toISOString().slice(0, 10) })() },
                { label: 'Last Year', value: `${new Date().getFullYear() - 1}-12-31` },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => { setAsOf(p.value); generate(p.value) }}
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
            <p className="text-[13px]">Select a date and click Generate</p>
          </div>
        )}

        {loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-24 text-zinc-500">
            <p className="text-[13px]">Generating balance sheet…</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Statement header */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-6 py-5 flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Balance Sheet</h2>
                <p className="text-[13px] text-zinc-500 mt-0.5">As of {data.asOf}</p>
              </div>
              <div className="flex items-center gap-3">
                {isBalanced !== null && (
                  <span className={`inline-flex items-center px-3 py-1 rounded text-[12px] font-semibold ${
                    isBalanced
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {isBalanced ? 'Balanced' : 'Unbalanced'}
                  </span>
                )}
                <button
                  onClick={() => window.print()}
                  className="text-[12px] px-4 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors print:hidden"
                >
                  Print
                </button>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* LEFT — ASSETS */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">Assets</span>
                </div>
                <div className="px-5 py-4 space-y-4">

                  {/* Current Assets */}
                  <div>
                    <SectionHeader label="Current Assets" color="text-zinc-500" />
                    <AccountTable accounts={data.assets.current} emptyLabel="No current assets" />
                    <Subtotal label="Total Current Assets" value={data.assets.current.reduce((s, a) => s + a.balance, 0)} />
                  </div>

                  {/* Fixed Assets */}
                  {(data.assets.fixed.length > 0) && (
                    <div>
                      <SectionHeader label="Fixed Assets" color="text-zinc-500" />
                      <AccountTable accounts={data.assets.fixed} emptyLabel="No fixed assets" />
                      <Subtotal label="Total Fixed Assets" value={data.assets.fixed.reduce((s, a) => s + a.balance, 0)} />
                    </div>
                  )}

                  {/* Total Assets */}
                  <div className="border-t-2 border-blue-500/40 pt-3 mt-3 flex items-center justify-between">
                    <span className="text-base font-bold text-zinc-100">Total Assets</span>
                    <span className="text-xl font-extrabold tabular-nums text-blue-400">{fmt(data.assets.totalAssets)}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT — LIABILITIES + EQUITY */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-400">Liabilities &amp; Equity</span>
                </div>
                <div className="px-5 py-4 space-y-4">

                  {/* Current Liabilities */}
                  <div>
                    <SectionHeader label="Current Liabilities" color="text-zinc-500" />
                    <AccountTable accounts={data.liabilities.current} emptyLabel="No current liabilities" />
                    <Subtotal label="Total Current Liabilities" value={data.liabilities.current.reduce((s, a) => s + a.balance, 0)} />
                  </div>

                  {/* Long-term Liabilities */}
                  {(data.liabilities.longTerm.length > 0) && (
                    <div>
                      <SectionHeader label="Long-Term Liabilities" color="text-zinc-500" />
                      <AccountTable accounts={data.liabilities.longTerm} emptyLabel="No long-term liabilities" />
                      <Subtotal label="Total Long-Term Liabilities" value={data.liabilities.longTerm.reduce((s, a) => s + a.balance, 0)} />
                    </div>
                  )}

                  {/* Total Liabilities */}
                  <Subtotal label="Total Liabilities" value={data.liabilities.totalLiabilities} large />

                  {/* Equity */}
                  <div>
                    <SectionHeader label="Equity" color="text-violet-400" />
                    <AccountTable accounts={data.equity.accounts} emptyLabel="No equity accounts" />
                    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/30">
                      <span className="text-zinc-300">Retained Earnings</span>
                      <span className={`tabular-nums font-medium text-sm ${data.equity.retainedEarnings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmt(data.equity.retainedEarnings)}
                      </span>
                    </div>
                    <Subtotal label="Total Equity" value={data.equity.totalEquity} large />
                  </div>

                  {/* Total Liabilities + Equity */}
                  <div className="border-t-2 border-rose-500/40 pt-3 mt-3 flex items-center justify-between">
                    <span className="text-base font-bold text-zinc-100">Total Liabilities &amp; Equity</span>
                    <span className="text-xl font-extrabold tabular-nums text-rose-400">{fmt(data.totalLiabilitiesAndEquity)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance check footer */}
            {isBalanced === false && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-5 py-3 text-red-400 text-sm">
                Warning: Assets ({fmt(data.assets.totalAssets)}) do not equal Liabilities + Equity ({fmt(data.totalLiabilitiesAndEquity)}).
                Difference: {fmt(Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity))}
              </div>
            )}
          </>
        )}

      </main>
    </>
  )
}
