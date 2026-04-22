'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Activity, Download, Printer, RefreshCw, Filter } from 'lucide-react'

interface CFRow { accountNo: string; accountName: string; amount: number }

interface CFResponse {
  operating: CFRow[]; totalOperating: number
  investing:  CFRow[]; totalInvesting: number
  financing:  CFRow[]; totalFinancing: number
  netChange: number
  dateFrom: string; dateTo: string
}

function fmt(n: number): string {
  const abs = Math.abs(n)
  const s   = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs)
  return n < 0 ? `(${s})` : s
}

function today()       { return new Date().toISOString().slice(0, 10) }
function firstOfYear() { return `${new Date().getFullYear()}-01-01` }

function SectionHeader({ label }: { label: string }) {
  return <tr><td colSpan={2} className="px-4 pt-5 pb-1"><span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">{label}</span></td></tr>
}

function DetailRows({ rows }: { rows: CFRow[] }) {
  return (
    <>
      {rows.map((r, i) => (
        <tr key={`${r.accountNo}-${i}`} className="border-b border-zinc-800/20 transition-colors"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <td className="pl-8 pr-4 py-1.5 text-zinc-300">{r.accountName}</td>
          <td className={`px-4 py-1.5 text-right tabular-nums ${r.amount < 0 ? 'text-red-400' : 'text-zinc-200'}`}>{fmt(r.amount)}</td>
        </tr>
      ))}
    </>
  )
}

function SubtotalRow({ label, amount, highlight }: { label: string; amount: number; highlight?: boolean }) {
  return (
    <tr style={{ background: highlight ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)' }} className="border-t border-zinc-800/50">
      <td className={`px-4 py-2 font-semibold text-[12px] ${highlight ? 'text-zinc-100' : 'text-zinc-300'}`}>{label}</td>
      <td className={`px-4 py-2 text-right tabular-nums font-semibold ${amount < 0 ? 'text-red-400' : highlight ? 'text-zinc-100' : 'text-zinc-200'}`}>{fmt(amount)}</td>
    </tr>
  )
}

export default function CashFlowPage() {
  const [dateFrom, setDateFrom] = useState(firstOfYear())
  const [dateTo,   setDateTo]   = useState(today())
  const [data,     setData]     = useState<CFResponse | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [ran,      setRan]      = useState(false)

  const run = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ dateFrom, dateTo })
      const res = await fetch(`/api/finance/reports/cash-flow?${qs}`)
      const json: CFResponse = await res.json()
      setData(json); setRan(true)
    } finally { setLoading(false) }
  }, [dateFrom, dateTo])

  const exportCsv = () => {
    if (!data) return
    const lines = ['Section,Account,Amount']
    data.operating.forEach(r => lines.push(`Operating,"${r.accountName}",${r.amount}`))
    lines.push(`Operating Total,,${data.totalOperating}`)
    data.investing.forEach(r => lines.push(`Investing,"${r.accountName}",${r.amount}`))
    lines.push(`Investing Total,,${data.totalInvesting}`)
    data.financing.forEach(r => lines.push(`Financing,"${r.accountName}",${r.amount}`))
    lines.push(`Financing Total,,${data.totalFinancing}`)
    lines.push(`Net Change in Cash,,${data.netChange}`)
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = `cash-flow-${dateTo}.csv`; a.click()
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
      <TopBar title="Cash Flow Statement" breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Reports', href: '/finance/reports' }]} actions={actions} />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Period</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-[11px] text-zinc-500 mb-1">Date From</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></div>
            <div><label className="block text-[11px] text-zinc-500 mb-1">Date To</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></div>
          </div>
        </div>

        {!ran && !loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-[13px]">Set period and click <strong className="text-zinc-300">Run Report</strong>.</p>
          </div>
        )}

        {ran && data && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <p className="text-[13px] font-semibold text-zinc-200">Cash Flow Statement</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Period: {data.dateFrom} – {data.dateTo}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left">Description</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <SectionHeader label="Operating Activities" />
                  <DetailRows rows={data.operating} />
                  <SubtotalRow label="Net Cash from Operating Activities" amount={data.totalOperating} highlight />
                  <SectionHeader label="Investing Activities" />
                  <DetailRows rows={data.investing} />
                  <SubtotalRow label="Net Cash from Investing Activities" amount={data.totalInvesting} highlight />
                  <SectionHeader label="Financing Activities" />
                  <DetailRows rows={data.financing} />
                  <SubtotalRow label="Net Cash from Financing Activities" amount={data.totalFinancing} highlight />
                  <tr style={{ background: 'rgba(99,102,241,0.12)' }} className="border-t-2 border-indigo-500/40">
                    <td className="px-4 py-3 font-bold text-[14px] text-zinc-100">Net Change in Cash</td>
                    <td className={`px-4 py-3 text-right tabular-nums font-bold text-[14px] ${data.netChange < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{fmt(data.netChange)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
