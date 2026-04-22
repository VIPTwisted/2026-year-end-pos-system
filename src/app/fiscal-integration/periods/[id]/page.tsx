'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { useParams } from 'next/navigation'
import { Calendar, Lock, CheckSquare, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface FiscalPeriod {
  id: string
  name: string
  storeId: string | null
  storeName: string | null
  startDate: string
  endDate: string | null
  status: string
  xReportCount: number
  zReportCount: number
  totalSales: number
  totalReturns: number
  totalTax: number
  cashDrawer: number
  variance: number
  closedBy: string | null
  closedAt: string | null
  auditedBy: string | null
  auditedAt: string | null
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    open: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    closing: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    closed: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
    audited: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  }
  return <span className={`text-xs font-medium border rounded-full px-3 py-1 capitalize ${cfg[status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'}`}>{status}</span>
}

const MOCK_X_REPORTS = [
  { id: 'x1', time: '09:00', cashier: 'Jane Smith', total: 2400.50 },
  { id: 'x2', time: '13:00', cashier: 'John Doe', total: 5100.00 },
  { id: 'x3', time: '17:00', cashier: 'Jane Smith', total: 3800.25 },
]

const MOCK_Z_REPORTS = [
  { id: 'z1', date: '2026-04-01', closedBy: 'Manager', total: 11300.75 },
]

export default function PeriodDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [period, setPeriod] = useState<FiscalPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [closedBy, setClosedBy] = useState('')
  const [auditedBy, setAuditedBy] = useState('')
  const [acting, setActing] = useState(false)

  const load = async () => {
    const res = await fetch(`/api/fiscal/periods/${id}`)
    const data = await res.json()
    setPeriod(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleClose = async () => {
    if (!closedBy.trim()) { alert('Enter your name'); return }
    setActing(true)
    await fetch(`/api/fiscal/periods/${id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closedBy }),
    })
    await load()
    setActing(false)
    setClosedBy('')
  }

  const handleAudit = async () => {
    if (!auditedBy.trim()) { alert('Enter auditor name'); return }
    setActing(true)
    await fetch(`/api/fiscal/periods/${id}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditedBy }),
    })
    await load()
    setActing(false)
    setAuditedBy('')
  }

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const fmtCur = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (loading) return <><TopBar title="Fiscal Period" /><main className="flex-1 p-6 text-zinc-600 text-sm">Loading...</main></>
  if (!period) return <><TopBar title="Fiscal Period" /><main className="flex-1 p-6 text-zinc-600 text-sm">Period not found.</main></>

  const expectedCash = period.cashDrawer
  const actualCash = period.cashDrawer + period.variance

  return (
    <>
      <TopBar title={period.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/fiscal-integration/periods" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">← Periods</Link>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100">{period.name}</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {period.storeName ?? 'All Stores'} · {fmt(period.startDate)}{period.endDate ? ` — ${fmt(period.endDate)}` : ' · Open'}
            </p>
            {period.closedBy && (
              <p className="text-xs text-zinc-600 mt-1">Closed by {period.closedBy} on {fmt(period.closedAt)}</p>
            )}
            {period.auditedBy && (
              <p className="text-xs text-zinc-600">Audited by {period.auditedBy} on {fmt(period.auditedAt)}</p>
            )}
          </div>
          <StatusBadge status={period.status} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sales', value: fmtCur(period.totalSales), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Total Returns', value: fmtCur(period.totalReturns), icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Total Tax', value: fmtCur(period.totalTax), icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Cash Variance', value: fmtCur(Math.abs(period.variance)), icon: AlertTriangle, color: period.variance < 0 ? 'text-red-400' : 'text-emerald-400', bg: period.variance < 0 ? 'bg-red-500/10' : 'bg-emerald-500/10' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-xl font-bold ${kpi.color}`}>{period.totalSales === 0 && kpi.label !== 'Cash Variance' ? '—' : kpi.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* X Reports */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">X Reports</h3>
              <span className="text-xs text-zinc-500">{period.xReportCount || MOCK_X_REPORTS.length} reports</span>
            </div>
            <div className="space-y-2">
              {MOCK_X_REPORTS.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                  <div>
                    <p className="text-xs text-zinc-300">{r.cashier}</p>
                    <p className="text-[10px] text-zinc-600">{r.time}</p>
                  </div>
                  <span className="text-xs font-medium text-zinc-200">{fmtCur(r.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Z Reports */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Z Reports</h3>
              <span className="text-xs text-zinc-500">{period.zReportCount || MOCK_Z_REPORTS.length} reports</span>
            </div>
            <div className="space-y-2">
              {MOCK_Z_REPORTS.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                  <div>
                    <p className="text-xs text-zinc-300">{r.closedBy}</p>
                    <p className="text-[10px] text-zinc-600">{r.date}</p>
                  </div>
                  <span className="text-xs font-medium text-zinc-200">{fmtCur(r.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cash Drawer Reconciliation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4">Cash Drawer Reconciliation</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-zinc-600 mb-1">Expected Cash</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtCur(expectedCash)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 mb-1">Actual Cash</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtCur(actualCash)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 mb-1">Variance</p>
              <p className={`text-lg font-semibold ${period.variance < 0 ? 'text-red-400' : period.variance > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {period.variance >= 0 ? '+' : ''}{fmtCur(period.variance)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {period.status === 'open' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Close Period</h3>
            <div className="flex items-center gap-3">
              <input
                value={closedBy}
                onChange={e => setClosedBy(e.target.value)}
                placeholder="Your name"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 w-48"
              />
              <button onClick={handleClose} disabled={acting || !closedBy.trim()}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Lock className="w-4 h-4" />
                {acting ? 'Closing...' : 'Close Period'}
              </button>
            </div>
            <p className="text-xs text-zinc-600 mt-2">This will compute final totals and generate a Z-report.</p>
          </div>
        )}

        {period.status === 'closed' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Audit Period</h3>
            <div className="flex items-center gap-3">
              <input
                value={auditedBy}
                onChange={e => setAuditedBy(e.target.value)}
                placeholder="Auditor name"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 w-48"
              />
              <button onClick={handleAudit} disabled={acting || !auditedBy.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <CheckSquare className="w-4 h-4" />
                {acting ? 'Auditing...' : 'Mark as Audited'}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
