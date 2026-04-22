import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowRight, DollarSign, Plus, Calculator, CheckCircle, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft:      'bg-zinc-700/40 text-zinc-400',
  calculated: 'bg-blue-500/20 text-blue-400',
  approved:   'bg-amber-500/20 text-amber-400',
  posted:     'bg-emerald-500/20 text-emerald-400',
}

export default async function PayrollRunsPage() {
  const runs = await prisma.payrollRun.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    total:      runs.length,
    draft:      runs.filter(r => r.status === 'draft').length,
    calculated: runs.filter(r => r.status === 'calculated').length,
    approved:   runs.filter(r => r.status === 'approved').length,
    posted:     runs.filter(r => r.status === 'posted').length,
    totalGross: runs.filter(r => r.status === 'posted').reduce((s, r) => s + r.totalGross, 0),
    totalNet:   runs.filter(r => r.status === 'posted').reduce((s, r) => s + r.totalNet, 0),
  }

  return (
    <>
      <TopBar title="Payroll Runs" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR / Payroll</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Payroll Runs</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{runs.length} runs total</p>
            </div>
            <Link href="/hr/payroll/runs/new">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
                <Plus className="w-3.5 h-3.5" /> New Run
              </button>
            </Link>
          </div>

          {/* Action Ribbon */}
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-800/60">
            {[
              { label: 'New Run', icon: Plus, href: '/hr/payroll/runs/new', cls: 'bg-blue-600 hover:bg-blue-500 text-white' },
              { label: 'Calculate', icon: Calculator, href: '#', cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
              { label: 'Approve', icon: CheckCircle, href: '#', cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
              { label: 'Post', icon: BookOpen, href: '#', cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
            ].map(({ label, icon: Icon, href, cls }) => (
              <Link key={label} href={href}>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-colors font-medium ${cls}`}>
                  <Icon className="w-3 h-3" /> {label}
                </button>
              </Link>
            ))}
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Runs',   value: String(stats.total),           color: 'text-zinc-100' },
              { label: 'Draft',        value: String(stats.draft),           color: 'text-zinc-400' },
              { label: 'Posted Gross', value: formatCurrency(stats.totalGross), color: 'text-emerald-400' },
              { label: 'Posted Net',   value: formatCurrency(stats.totalNet),   color: 'text-cyan-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[20px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          {runs.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12">
              <DollarSign className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500 mb-4">No payroll runs yet.</p>
              <Link href="/hr/payroll/runs/new">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                  <Plus className="w-3.5 h-3.5" /> New Run
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Run No.', 'Period', 'Pay Date', 'Status', 'Employees', 'Total Gross', 'Total Net', 'Employer Costs', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          ['Employees','Total Gross','Total Net','Employer Costs'].includes(h) ? 'text-right' :
                          h === 'Status' ? 'text-center' : 'text-left'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {runs.map(run => (
                      <tr key={run.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/hr/payroll/runs/${run.id}`} className="font-mono text-[11px] text-blue-400 hover:underline">
                            {run.runNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">
                          {formatDate(run.periodStart)} – {formatDate(run.periodEnd)}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-300 whitespace-nowrap">{formatDate(run.payDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STATUS_COLOR[run.status] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-300 tabular-nums">{run.employeeCount}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-100 tabular-nums">{formatCurrency(run.totalGross)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">{formatCurrency(run.totalNet)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-400 tabular-nums">{formatCurrency(run.totalEmployerCosts)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/hr/payroll/runs/${run.id}`} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
