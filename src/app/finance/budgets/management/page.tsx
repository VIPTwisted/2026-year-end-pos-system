'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import {
  Plus, Edit2, Trash2, SendHorizontal, CheckCircle2, XCircle, Printer,
  PieChart, AlertTriangle, ClipboardList, FileCheck, Clock,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Budget {
  id: string
  code: string
  description: string
  ledger: string
  fiscalYear: string
  totalBudget: number
  committed: number
  actual: number
  remaining: number
  status: string
  workflow: string
}

interface Summary {
  budgetPlansCount: number
  budgetRegistersCount: number
  overbudgetAlerts: number
  pendingApprovals: number
}

const STATUS_STYLES: Record<string, string> = {
  'Active':      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Draft':       'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
  'Over Budget': 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  'Closed':      'bg-red-500/10 text-red-400 border border-red-500/20',
}

const WORKFLOW_STYLES: Record<string, string> = {
  'Approved':  'bg-emerald-500/10 text-emerald-400',
  'Pending':   'bg-zinc-700/60 text-zinc-400',
  'In Review': 'bg-blue-500/10 text-blue-400',
  'Rejected':  'bg-red-500/10 text-red-400',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function pct(num: number, denom: number) {
  if (!denom) return 0
  return Math.round((num / denom) * 100)
}

export default function BudgetManagementPage() {
  const [summary, setSummary] = useState<Summary>({ budgetPlansCount: 0, budgetRegistersCount: 0, overbudgetAlerts: 0, pendingApprovals: 0 })
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/finance/budgets/management')
      .then(r => r.json())
      .then(d => { setSummary(d.summary); setBudgets(d.budgets); setLoading(false) })
  }, [])

  function toggleRow(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Budget Management"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Budgets', href: '/finance/budgets' },
          { label: 'Management', href: '/finance/budgets/management' },
        ]}
      />

      {/* Action Ribbon */}
      <div className="flex items-center gap-1.5 px-6 py-2.5 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)', background: '#0f1129' }}>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
          <Plus className="w-3.5 h-3.5" /> New
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-zinc-300 hover:bg-white/5 transition-colors">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-zinc-300 hover:bg-white/5 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-zinc-300 hover:bg-white/5 transition-colors">
          <SendHorizontal className="w-3.5 h-3.5" /> Submit for approval
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition-colors">
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-zinc-300 hover:bg-white/5 transition-colors">
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Summary Panel */}
        <aside className="w-56 shrink-0 border-r flex flex-col gap-2 p-3 overflow-y-auto" style={{ borderColor: 'rgba(99,102,241,0.12)', background: '#0f1129' }}>
          {/* Create Budget CTA */}
          <Link href="/finance/budgets/new"
            className="flex items-center gap-2 px-3 py-3 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors group">
            <div className="w-7 h-7 rounded bg-indigo-600/40 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-indigo-300" />
            </div>
            <span className="text-[12px] font-semibold text-indigo-300 group-hover:text-indigo-200">Create budget</span>
          </Link>

          <div className="mt-1 space-y-1.5">
            <SummaryTile icon={<PieChart className="w-4 h-4 text-indigo-400" />} label="Budget plans" value={summary.budgetPlansCount} href="/budget/plans" />
            <SummaryTile icon={<ClipboardList className="w-4 h-4 text-blue-400" />} label="Budget registers" value={summary.budgetRegistersCount} href="/finance/budgets" />
            <SummaryTile icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} label="Overbudget alerts" value={summary.overbudgetAlerts} amber href="/finance/budgets" />
            <SummaryTile icon={<Clock className="w-4 h-4 text-zinc-400" />} label="Pending approvals" value={summary.pendingApprovals} href="/approval" />
          </div>

          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 px-1">Related links</p>
            <RelatedLink label="Budget configuration" href="/configuration" />
            <RelatedLink label="Budget cycles" href="/finance/budgets" />
            <RelatedLink label="Budget control" href="/finance/budgets" />
            <RelatedLink label="Allocation terms" href="/finance/budgets" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">Loading budgets…</div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(99,102,241,0.15)', background: '#16213e' }}>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)', background: '#0d0e24' }}>
                    <th className="w-8 px-3 py-2.5">
                      <input type="checkbox" className="accent-indigo-500" />
                    </th>
                    {['Budget code','Description','Ledger','Fiscal year','Total budget','Committed','Actual','Remaining','Status','Workflow'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-zinc-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b, i) => (
                    <tr
                      key={b.id}
                      onClick={() => toggleRow(b.id)}
                      className="cursor-pointer transition-colors hover:bg-indigo-500/5"
                      style={{
                        borderBottom: i < budgets.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: selected.includes(b.id) ? 'rgba(99,102,241,0.08)' : undefined,
                      }}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleRow(b.id)} className="accent-indigo-500" />
                      </td>
                      <td className="px-3 py-2.5">
                        <Link href={`/finance/budgets/${b.id}`} onClick={e => e.stopPropagation()} className="text-indigo-400 hover:text-indigo-300 font-medium">
                          {b.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-300">{b.description}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{b.ledger}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{b.fiscalYear}</td>
                      <td className="px-3 py-2.5 text-zinc-100 font-mono">{fmtFull(b.totalBudget)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-blue-300 font-mono">{fmt(b.committed)}</span>
                          <div className="w-16 h-1 rounded-full bg-zinc-700">
                            <div className="h-1 rounded-full bg-blue-500" style={{ width: `${pct(b.committed, b.totalBudget)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-zinc-100 font-mono">{fmt(b.actual)}</span>
                          <div className="w-16 h-1 rounded-full bg-zinc-700">
                            <div className={`h-1 rounded-full ${pct(b.actual, b.totalBudget) > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct(b.actual, b.totalBudget), 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className={`px-3 py-2.5 font-mono ${b.remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {fmt(b.remaining)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[b.status] ?? 'bg-zinc-700/60 text-zinc-400'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${WORKFLOW_STYLES[b.workflow] ?? 'bg-zinc-700/60 text-zinc-400'}`}>
                          {b.workflow === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {b.workflow}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function SummaryTile({ icon, label, value, href, amber }: { icon: React.ReactNode; label: string; value: number; href: string; amber?: boolean }) {
  return (
    <Link href={href} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[11px] text-zinc-400">{label}</span>
      </div>
      <span className={`text-sm font-bold ${amber ? 'text-amber-400' : 'text-zinc-100'}`}>{value}</span>
    </Link>
  )
}

function RelatedLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="block px-2 py-1.5 text-[11px] text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/5 rounded transition-colors">
      {label}
    </Link>
  )
}
