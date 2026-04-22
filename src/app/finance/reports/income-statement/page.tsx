'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { TrendingUp, Download, Printer, RefreshCw, Filter } from 'lucide-react'

interface ISRow {
  id: string
  accountNo: string
  accountName: string
  type: string
  subtype: string | null
  current: number
  previous: number
  ytd: number
}

interface SectionTotals { current: number; previous: number; ytd: number }

interface ISResponse {
  rows: ISRow[]
  sections: {
    revenue: SectionTotals
    cogs: SectionTotals
    grossProfit: SectionTotals
    opEx: SectionTotals
    opIncome: SectionTotals
    otherInEx: SectionTotals
    netIncome: SectionTotals
  }
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n))
}

function pct(part: number, total: number): string {
  if (!total) return '–'
  return (Math.abs(part / total) * 100).toFixed(1) + '%'
}

function today()       { return new Date().toISOString().slice(0, 10) }
function firstOfYear() { return `${new Date().getFullYear()}-01-01` }
function prevYearStart(){ return `${new Date().getFullYear() - 1}-01-01` }
function prevYearEnd()  { return `${new Date().getFullYear() - 1}-12-31` }

function SectionHeader({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={7} className="px-4 pt-4 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">{label}</span>
      </td>
    </tr>
  )
}

function DetailRow({ row, revTotal }: { row: ISRow; revTotal: number }) {
  const neg = row.current < 0
  return (
    <tr className="border-b border-zinc-800/20 transition-colors"
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <td className="px-4 py-1.5 font-mono text-[11px] text-indigo-400/70 w-24">{row.accountNo}</td>
      <td className="px-4 py-1.5 text-zinc-300 pl-8">{row.accountName}</td>
      <td className={`px-4 py-1.5 text-right tabular-nums ${neg ? 'text-red-400' : 'text-zinc-200'}`}>{neg ? `(${fmt(row.current)})` : fmt(row.current)}</td>
      <td className="px-4 py-1.5 text-right tabular-nums text-zinc-500 text-[11px]">{pct(row.current, revTotal)}</td>
      <td className={`px-4 py-1.5 text-right tabular-nums ${row.previous < 0 ? 'text-red-400' : 'text-zinc-400'}`}>{row.previous < 0 ? `(${fmt(row.previous)})` : fmt(row.previous)}</td>
      <td className="px-4 py-1.5 text-right tabular-nums text-zinc-500 text-[11px]">{pct(row.previous, revTotal)}</td>
      <td className={`px-4 py-1.5 text-right tabular-nums ${row.ytd < 0 ? 'text-red-400' : 'text-zinc-300'}`}>{row.ytd < 0 ? `(${fmt(row.ytd)})` : fmt(row.ytd)}</td>
    </tr>
  )
}

function TotalRow({ label, vals, highlight, negative }: { label: string; vals: SectionTotals; highlight?: boolean; negative?: boolean }) {
  const style = highlight ? { background: 'rgba(99,102,241,0.08)' } : { background: 'rgba(255,255,255,0.02)' }
  const colorCur = negative && vals.current < 0 ? 'text-red-400' : highlight ? 'text-zinc-100' : 'text-zinc-200'
  return (
    <tr style={style} className="border-t border-zinc-800/50">
      <td></td>
      <td className={`px-4 py-2 font-semibold text-[12px] ${highlight ? 'text-zinc-100' : 'text-zinc-300'}`}>{label}</td>
      <td className={`px-4 py-2 text-right tabular-nums font-semibold ${colorCur}`}>
        {vals.current < 0 ? `(${fmt(vals.current)})` : fmt(vals.current)}
      </td>
      <td></td>
      <td className={`px-4 py-2 text-right tabular-nums font-semibold ${vals.previous < 0 ? 'text-red-400' : 'text-zinc-300'}`}>
        {vals.previous < 0 ? `(${fmt(vals.previous)})` : fmt(vals.previous)}
      </td>
      <td></td>
      <td className={`px-4 py-2 text-right tabular-nums font-semibold ${vals.ytd < 0 ? 'text-red-400' : 'text-zinc-200'}`}>
        {vals.ytd < 0 ? `(${fmt(vals.ytd)})` : fmt(vals.ytd)}
      </td>
    </tr>
  )
}

export default function IncomeStatementPage() {
  const [dateFrom, setDateFrom] = useState(firstOfYear())
  const [dateTo,   setDateTo]   = useState(today())
  const [prevFrom, setPrevFrom] = useState(prevYearStart())
  const [prevTo,   setPrevTo]   = useState(prevYearEnd())
  const [ytdFrom,  setYtdFrom]  = useState(firstOfYear())
  const [ytdTo,    setYtdTo]    = useState(today())
  const [data,     setData]     = useState<ISResponse | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [ran,      setRan]      = useState(false)

  const run = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ dateFrom, dateTo, prevFrom, prevTo, ytdFrom, ytdTo })
      const res = await fetch(`/api/finance/reports/income-statement?${qs}`)
      const json: ISResponse = await res.json()
      setData(json); setRan(true)
    } finally { setLoading(false) }
  }, [dateFrom, dateTo, prevFrom, prevTo, ytdFrom, ytdTo])

  const exportCsv = () => {
    if (!data) return
    const lines = ['Account No,Account Name,Current Period,Previous Period,YTD', ...data.rows.map(r => `${r.accountNo},"${r.accountName}",${r.current},${r.previous},${r.ytd}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = `income-statement-${dateTo}.csv`; a.click()
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

  const s = data?.sections

  return (
    <>
      <TopBar title="Income Statement (P&L)" breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Reports', href: '/finance/reports' }]} actions={actions} />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Period Comparison</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] font-medium text-zinc-400 mb-2">Current Period</p>
              <div className="space-y-2">
                <div><label className="block text-[11px] text-zinc-500 mb-1">From</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></div>
                <div><label className="block text-[11px] text-zinc-500 mb-1">To</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-400 mb-2">Previous Period</p>
              <div className="space-y-2">
                <div><label className="block text-[11px] text-zinc-500 mb-1">From</label><input type="date" value={prevFrom} onChange={e => setPrevFrom(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></div>
                <div><label className="block text-[11px] text-zinc-500 mb-1">To</label><input type="date" value={prevTo} onChange={e => setPrevTo(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-400 mb-2">YTD</p>
              <div className="space-y-2">
                <div><label className="block text-[11px] text-zinc-500 mb-1">From</label><input type="date" value={ytdFrom} onChange={e => setYtdFrom(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></div>
                <div><label className="block text-[11px] text-zinc-500 mb-1">To</label><input type="date" value={ytdTo} onChange={e => setYtdTo(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></div>
              </div>
            </div>
          </div>
        </div>

        {!ran && !loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <TrendingUp className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-[13px]">Set comparison periods above and click <strong className="text-zinc-300">Run Report</strong>.</p>
          </div>
        )}

        {ran && data && s && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <p className="text-[13px] font-semibold text-zinc-200">Income Statement</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Current: {dateFrom} – {dateTo} | Previous: {prevFrom} – {prevTo}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                    <th className="w-24 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left">Acct No.</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left">Account</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">Current Period</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">%</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">Previous Period</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">%</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  <SectionHeader label="Revenue" />
                  {data.rows.filter(r => r.type === 'revenue').map(r => <DetailRow key={r.id} row={r} revTotal={s.revenue.current} />)}
                  <TotalRow label="Total Revenue" vals={s.revenue} highlight />
                  <SectionHeader label="Cost of Goods Sold" />
                  {data.rows.filter(r => r.type === 'expense' && r.subtype === 'cogs').map(r => <DetailRow key={r.id} row={r} revTotal={s.revenue.current} />)}
                  <TotalRow label="Total COGS" vals={s.cogs} />
                  <TotalRow label="Gross Profit" vals={s.grossProfit} highlight />
                  <SectionHeader label="Operating Expenses" />
                  {data.rows.filter(r => r.type === 'expense' && r.subtype !== 'cogs' && r.subtype !== 'other').map(r => <DetailRow key={r.id} row={r} revTotal={s.revenue.current} />)}
                  <TotalRow label="Total Operating Expenses" vals={s.opEx} />
                  <TotalRow label="Operating Income" vals={s.opIncome} highlight />
                  <SectionHeader label="Other Income / Expense" />
                  {data.rows.filter(r => r.type === 'expense' && r.subtype === 'other').map(r => <DetailRow key={r.id} row={r} revTotal={s.revenue.current} />)}
                  <TotalRow label="Other Income / Expense" vals={s.otherInEx} />
                  <TotalRow label="Net Income" vals={s.netIncome} highlight negative />
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
