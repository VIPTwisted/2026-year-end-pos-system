'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  Plus, SendHorizontal, CheckCircle2, XCircle, Download, Printer,
  FileText, User, AlertTriangle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ExpenseReport {
  id: string
  reportNumber: string
  employee: string
  purpose: string
  total: number
  status: string
  submitted: string | null
  policyViolations: number
}

interface KPI {
  myOpenExpenses: number
  awaitingApproval: number
  returnedForCorrection: number
  approvedThisMonth: number
}

interface ExpenseLimit {
  category: string
  limit: number
  per: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  Draft:     { bg: 'bg-zinc-700/60', text: 'text-zinc-400',    label: 'Draft' },
  Submitted: { bg: 'bg-blue-500/10', text: 'text-blue-400',    label: 'Submitted' },
  'In Review': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'In Review' },
  Approved:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Approved' },
  Rejected:  { bg: 'bg-red-500/10',  text: 'text-red-400',     label: 'Rejected' },
  Returned:  { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Returned' },
  Paid:      { bg: 'bg-teal-500/10', text: 'text-teal-400',    label: 'Paid' },
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function ExpenseManagementPage() {
  const [kpi, setKpi] = useState<KPI>({ myOpenExpenses: 0, awaitingApproval: 0, returnedForCorrection: 0, approvedThisMonth: 0 })
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [limits, setLimits] = useState<ExpenseLimit[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/finance/expense-management')
      .then(r => r.json())
      .then(d => { setKpi(d.kpi); setReports(d.reports); setLimits(d.expenseLimits); setLoading(false) })
  }, [])

  function toggleRow(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Expense Management"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Expense Management', href: '/finance/expense-management' },
        ]}
      />

      {/* Action Bar */}
      <div className="flex items-center gap-1.5 px-6 py-2.5 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)', background: '#0f1129' }}>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
          <Plus className="w-3.5 h-3.5" /> New expense report
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-zinc-300 hover:bg-white/5 transition-colors">
          <SendHorizontal className="w-3.5 h-3.5" /> Submit
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition-colors">
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-zinc-300 hover:bg-white/5 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-zinc-300 hover:bg-white/5 transition-colors">
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-5 flex flex-col gap-5">
          {/* KPI Tiles */}
          <div className="grid grid-cols-4 gap-3">
            <KpiTile label="My open expenses" value={kpi.myOpenExpenses} color="indigo" icon={<FileText className="w-4 h-4" />} />
            <KpiTile label="Awaiting approval" value={kpi.awaitingApproval} color="blue" icon={<CheckCircle2 className="w-4 h-4" />} />
            <KpiTile label="Returned for correction" value={kpi.returnedForCorrection} color="orange" icon={<AlertTriangle className="w-4 h-4" />} />
            <KpiTile label="Approved this month" value={kpi.approvedThisMonth} color="emerald" icon={<CheckCircle2 className="w-4 h-4" />} />
          </div>

          {/* Expense Report Table */}
          {loading ? (
            <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">Loading reports…</div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(99,102,241,0.15)', background: '#16213e' }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(99,102,241,0.1)', background: '#0d0e24' }}>
                <span className="text-[12px] font-semibold text-zinc-300">Expense Reports</span>
                <span className="text-[11px] text-zinc-600">{reports.length} records</span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(13,14,36,0.5)' }}>
                    <th className="w-8 px-3 py-2.5"><input type="checkbox" className="accent-indigo-500" /></th>
                    {['Report #','Employee','Purpose','Total','Status','Submitted','Policy violations'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-zinc-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => {
                    const st = STATUS_STYLES[r.status] ?? { bg: 'bg-zinc-700/60', text: 'text-zinc-400', label: r.status }
                    return (
                      <tr
                        key={r.id}
                        onClick={() => toggleRow(r.id)}
                        className="cursor-pointer hover:bg-indigo-500/5 transition-colors"
                        style={{
                          borderBottom: i < reports.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          background: selected.includes(r.id) ? 'rgba(99,102,241,0.08)' : undefined,
                        }}
                      >
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleRow(r.id)} className="accent-indigo-500" />
                        </td>
                        <td className="px-3 py-2.5 text-indigo-400 font-medium">{r.reportNumber}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold shrink-0">
                              {r.employee.charAt(0)}
                            </div>
                            <span className="text-zinc-200">{r.employee}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-400 max-w-xs truncate">{r.purpose}</td>
                        <td className="px-3 py-2.5 text-zinc-100 font-mono font-semibold">{fmt(r.total)}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-500">{r.submitted ?? '—'}</td>
                        <td className="px-3 py-2.5">
                          {r.policyViolations > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-semibold border border-red-500/20">
                              <AlertTriangle className="w-3 h-3" /> {r.policyViolations}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Right Panel */}
        <aside className="w-64 shrink-0 border-l overflow-y-auto p-4 flex flex-col gap-4" style={{ borderColor: 'rgba(99,102,241,0.12)', background: '#0f1129' }}>
          {/* My Profile */}
          <div className="rounded-lg p-3" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-zinc-200">My Profile</p>
                <p className="text-[10px] text-zinc-500">Finance Employee</p>
              </div>
            </div>
            <div className="space-y-1">
              <ProfileRow label="Dept" value="Operations" />
              <ProfileRow label="Manager" value="D. Martinez" />
              <ProfileRow label="YTD Expenses" value="$4,408" />
              <ProfileRow label="Annual Limit" value="$15,000" />
            </div>
          </div>

          {/* Expense Limits */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Expense limits by category</p>
            <div className="space-y-1.5">
              {limits.map(l => (
                <div key={l.category} className="flex items-center justify-between px-2.5 py-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-[11px] text-zinc-400 truncate">{l.category}</span>
                  <span className="text-[11px] font-semibold text-zinc-200 ml-2 shrink-0">${l.limit}<span className="text-zinc-600">/{l.per}</span></span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function KpiTile({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const palette: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    indigo:  { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)',  text: '#a5b4fc', icon: '#818cf8' },
    blue:    { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)',  text: '#93c5fd', icon: '#60a5fa' },
    orange:  { bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.25)',  text: '#fdba74', icon: '#fb923c' },
    emerald: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  text: '#6ee7b7', icon: '#34d399' },
  }
  const p = palette[color] ?? palette.indigo
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#16213e', border: `1px solid rgba(99,102,241,0.15)` }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-500">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: p.bg, color: p.icon }}>
          {icon}
        </div>
      </div>
      <span className="text-3xl font-bold" style={{ color: p.text }}>{value}</span>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[10px] text-zinc-600">{label}</span>
      <span className="text-[10px] text-zinc-400">{value}</span>
    </div>
  )
}
