'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BarChart2, Download, Printer, RefreshCw, Filter } from 'lucide-react'

interface AcctLine { id: string; accountNo: string; accountName: string; balance: number }

interface BSSection {
  assets: { current: AcctLine[]; fixed: AcctLine[]; totalCurrentAssets: number; totalFixedAssets: number; totalAssets: number }
  liabilities: { current: AcctLine[]; longTerm: AcctLine[]; totalCurrentLiab: number; totalLtLiab: number; totalLiabilities: number }
  equity: { accounts: AcctLine[]; totalEquity: number }
  totalLiabilitiesAndEquity: number
}

interface BSResponse { current: BSSection; previous: BSSection; asOf: string; prevAsOf: string }

function fmt(n: number): string {
  const abs = Math.abs(n)
  const s   = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs)
  return n < 0 ? `(${s})` : s
}

function today()    { return new Date().toISOString().slice(0, 10) }
function prevYear() { return `${new Date().getFullYear() - 1}-12-31` }

function AcctRows({ rows, curCol, prevCol }: { rows: AcctLine[]; curCol?: boolean; prevCol?: boolean }) {
  return (
    <>
      {rows.map((a) => (
        <tr key={a.id} className="border-b border-zinc-800/20 transition-colors"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <td className="pl-8 pr-4 py-1.5 font-mono text-[11px] text-indigo-400/70 w-24">{a.accountNo}</td>
          <td className="px-4 py-1.5 text-zinc-300">{a.accountName}</td>
          {curCol  && <td className={`px-4 py-1.5 text-right tabular-nums ${a.balance < 0 ? 'text-red-400' : 'text-zinc-200'}`}>{fmt(a.balance)}</td>}
          {prevCol && <td className={`px-4 py-1.5 text-right tabular-nums ${a.balance < 0 ? 'text-red-400' : 'text-zinc-400'}`}>{fmt(a.balance)}</td>}
        </tr>
      ))}
    </>
  )
}

function SubtotalRow({ label, cur, prev }: { label: string; cur: number; prev: number }) {
  return (
    <tr style={{ background: 'rgba(255,255,255,0.02)' }} className="border-t border-zinc-800/40">
      <td></td>
      <td className="px-4 py-2 font-semibold text-[12px] text-zinc-300">{label}</td>
      <td className={`px-4 py-2 text-right tabular-nums font-semibold ${cur < 0 ? 'text-red-400' : 'text-zinc-100'}`}>{fmt(cur)}</td>
      <td className={`px-4 py-2 text-right tabular-nums font-semibold ${prev < 0 ? 'text-red-400' : 'text-zinc-400'}`}>{fmt(prev)}</td>
    </tr>
  )
}

function TotalRow({ label, cur, prev }: { label: string; cur: number; prev: number }) {
  return (
    <tr style={{ background: 'rgba(99,102,241,0.08)' }} className="border-t-2 border-indigo-500/30">
      <td></td>
      <td className="px-4 py-2.5 font-semibold text-[13px] text-zinc-100">{label}</td>
      <td className={`px-4 py-2.5 text-right tabular-nums font-bold text-[13px] ${cur < 0 ? 'text-red-400' : 'text-zinc-100'}`}>{fmt(cur)}</td>
      <td className={`px-4 py-2.5 text-right tabular-nums font-bold text-[13px] ${prev < 0 ? 'text-red-400' : 'text-zinc-300'}`}>{fmt(prev)}</td>
    </tr>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr><td colSpan={4} className="px-4 pt-5 pb-1"><span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">{label}</span></td></tr>
  )
}

export default function BalanceSheetPage() {
  const [asOf,    setAsOf]    = useState(today())
  const [prevAsOf,setPrevAsOf]= useState(prevYear())
  const [data,    setData]    = useState<BSResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [ran,     setRan]     = useState(false)

  const run = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ asOf, prevAsOf })
      const res = await fetch(`/api/finance/reports/balance-sheet?${qs}`)
      const json: BSResponse = await res.json()
      setData(json); setRan(true)
    } finally { setLoading(false) }
  }, [asOf, prevAsOf])

  const exportCsv = () => {
    if (!data) return
    const c = data.current
    const lines: string[] = ['Section,Account No,Account Name,Current Balance,Previous Balance']
    const push = (section: string, rows: AcctLine[], prevRows: AcctLine[]) => {
      rows.forEach(r => {
        const p = prevRows.find(x => x.id === r.id)
        lines.push(`${section},${r.accountNo},"${r.accountName}",${r.balance},${p?.balance ?? 0}`)
      })
    }
    push('Current Assets', c.assets.current, data.previous.assets.current)
    push('Fixed Assets', c.assets.fixed, data.previous.assets.fixed)
    push('Current Liab', c.liabilities.current, data.previous.liabilities.current)
    push('LT Liab', c.liabilities.longTerm, data.previous.liabilities.longTerm)
    push('Equity', c.equity.accounts, data.previous.equity.accounts)
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = `balance-sheet-${asOf}.csv`; a.click()
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
      <TopBar title="Balance Sheet" breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Reports', href: '/finance/reports' }]} actions={actions} />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">As Of Date</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Current Date</label>
              <input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Previous Year Date</label>
              <input type="date" value={prevAsOf} onChange={e => setPrevAsOf(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        {!ran && !loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <BarChart2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-[13px]">Select dates and click <strong className="text-zinc-300">Run Report</strong>.</p>
          </div>
        )}

        {ran && data && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <p className="text-[13px] font-semibold text-zinc-200">Balance Sheet</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">As of {asOf} vs {prevAsOf}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                    <th className="w-24 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left">Acct No.</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left">Account</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">Current ({asOf})</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">Previous ({prevAsOf})</th>
                  </tr>
                </thead>
                <tbody>
                  <SectionHeader label="Assets" />
                  <tr><td colSpan={4} className="pl-8 px-4 pt-2 pb-0.5 text-[11px] text-zinc-500 font-medium">Current Assets</td></tr>
                  <AcctRows rows={data.current.assets.current} curCol prevCol />
                  <SubtotalRow label="Total Current Assets" cur={data.current.assets.totalCurrentAssets} prev={data.previous.assets.totalCurrentAssets} />
                  <tr><td colSpan={4} className="pl-8 px-4 pt-3 pb-0.5 text-[11px] text-zinc-500 font-medium">Fixed Assets</td></tr>
                  <AcctRows rows={data.current.assets.fixed} curCol prevCol />
                  <SubtotalRow label="Total Fixed Assets" cur={data.current.assets.totalFixedAssets} prev={data.previous.assets.totalFixedAssets} />
                  <TotalRow label="Total Assets" cur={data.current.assets.totalAssets} prev={data.previous.assets.totalAssets} />
                  <SectionHeader label="Liabilities" />
                  <tr><td colSpan={4} className="pl-8 px-4 pt-2 pb-0.5 text-[11px] text-zinc-500 font-medium">Current Liabilities</td></tr>
                  <AcctRows rows={data.current.liabilities.current} curCol prevCol />
                  <SubtotalRow label="Total Current Liabilities" cur={data.current.liabilities.totalCurrentLiab} prev={data.previous.liabilities.totalCurrentLiab} />
                  <tr><td colSpan={4} className="pl-8 px-4 pt-3 pb-0.5 text-[11px] text-zinc-500 font-medium">Long-Term Liabilities</td></tr>
                  <AcctRows rows={data.current.liabilities.longTerm} curCol prevCol />
                  <SubtotalRow label="Total Long-Term Liabilities" cur={data.current.liabilities.totalLtLiab} prev={data.previous.liabilities.totalLtLiab} />
                  <TotalRow label="Total Liabilities" cur={data.current.liabilities.totalLiabilities} prev={data.previous.liabilities.totalLiabilities} />
                  <SectionHeader label="Equity" />
                  <AcctRows rows={data.current.equity.accounts} curCol prevCol />
                  <TotalRow label="Total Equity" cur={data.current.equity.totalEquity} prev={data.previous.equity.totalEquity} />
                  <TotalRow label="Total Liabilities & Equity" cur={data.current.totalLiabilitiesAndEquity} prev={data.previous.totalLiabilitiesAndEquity} />
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
