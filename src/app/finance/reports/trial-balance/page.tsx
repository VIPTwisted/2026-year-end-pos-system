'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BarChart3, Download, Printer, RefreshCw, Filter } from 'lucide-react'

interface TBRow {
  id: string
  accountNo: string
  accountName: string
  accountType: string
  netChangeDebit: number
  netChangeCredit: number
  balanceDebit: number
  balanceCredit: number
}

interface Totals {
  netChangeDebit: number
  netChangeCredit: number
  balanceDebit: number
  balanceCredit: number
}

interface TBResponse {
  rows: TBRow[]
  totals: Totals
}

function fmt(n: number): string {
  if (n === 0) return '–'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtTotal(n: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function today() { return new Date().toISOString().slice(0, 10) }
function firstOfYear() { return `${new Date().getFullYear()}-01-01` }

const ACCOUNT_TYPES = ['all', 'asset', 'liability', 'equity', 'revenue', 'expense']

export default function TrialBalancePage() {
  const [dateFrom,       setDateFrom]       = useState(firstOfYear())
  const [dateTo,         setDateTo]         = useState(today())
  const [accountType,    setAccountType]    = useState('all')
  const [includeClosing, setIncludeClosing] = useState(false)
  const [data,           setData]           = useState<TBResponse | null>(null)
  const [loading,        setLoading]        = useState(false)
  const [ran,            setRan]            = useState(false)

  const run = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ dateFrom, dateTo, accountType, includeClosing: String(includeClosing) })
      const res = await fetch(`/api/finance/reports/trial-balance?${qs}`)
      const json: TBResponse = await res.json()
      setData(json); setRan(true)
    } finally { setLoading(false) }
  }, [dateFrom, dateTo, accountType, includeClosing])

  const exportCsv = () => {
    if (!data) return
    const header = 'Account No,Account Name,Account Type,Net Change Debit,Net Change Credit,Balance Debit,Balance Credit'
    const rows = data.rows.map(r => `${r.accountNo},"${r.accountName}",${r.accountType},${r.netChangeDebit},${r.netChangeCredit},${r.balanceDebit},${r.balanceCredit}`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = `trial-balance-${dateTo}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const actions = (
    <div className="flex items-center gap-2">
      <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded transition-colors" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Printer className="w-3.5 h-3.5" /> Print
      </button>
      <button onClick={exportCsv} disabled={!data} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded transition-colors disabled:opacity-40" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Download className="w-3.5 h-3.5" /> Export to Excel
      </button>
      <button onClick={run} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium rounded transition-colors disabled:opacity-60">
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Running…' : 'Run Report'}
      </button>
    </div>
  )

  return (
    <>
      <TopBar title="Trial Balance" breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Reports', href: '/finance/reports' }]} actions={actions} />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Filter</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Date From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Date To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Account Type</label>
              <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500">
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeClosing} onChange={e => setIncludeClosing(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
                <span className="text-[12px] text-zinc-400">Include Closing Entries</span>
              </label>
            </div>
          </div>
        </div>

        {!ran && !loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <BarChart3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-[13px]">Set filters above and click <strong className="text-zinc-300">Run Report</strong> to generate the Trial Balance.</p>
          </div>
        )}

        {ran && data && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-zinc-200">Trial Balance</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Period: {dateFrom} – {dateTo}</p>
              </div>
              <span className="text-[11px] text-zinc-600">{data.rows.length} accounts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-28">Account No.</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Change (Dr)</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Change (Cr)</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance (Dr)</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance (Cr)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={row.id} className="border-b border-zinc-800/30 transition-colors" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                    >
                      <td className="px-4 py-2 font-mono text-[11px] text-indigo-400">{row.accountNo}</td>
                      <td className="px-4 py-2 text-zinc-200">{row.accountName}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">{fmt(row.netChangeDebit)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">{fmt(row.netChangeCredit)}</td>
                      <td className={`px-4 py-2 text-right tabular-nums font-medium ${row.balanceDebit < 0 ? 'text-red-400' : 'text-zinc-200'}`}>{fmt(row.balanceDebit)}</td>
                      <td className={`px-4 py-2 text-right tabular-nums font-medium ${row.balanceCredit < 0 ? 'text-red-400' : 'text-zinc-200'}`}>{fmt(row.balanceCredit)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'rgba(99,102,241,0.08)' }} className="border-t-2 border-indigo-500/30">
                    <td className="px-4 py-2.5 font-semibold text-[12px] text-zinc-300" colSpan={2}>Grand Total</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-100">{fmtTotal(data.totals.netChangeDebit)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-100">{fmtTotal(data.totals.netChangeCredit)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-100">{fmtTotal(data.totals.balanceDebit)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-100">{fmtTotal(data.totals.balanceCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
