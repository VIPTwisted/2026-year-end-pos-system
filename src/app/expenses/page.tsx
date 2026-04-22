export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Receipt, Plus, ArrowRight } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-zinc-700/40 text-zinc-400',
  submitted: 'bg-blue-500/20 text-blue-400',
  approved:  'bg-emerald-500/20 text-emerald-400',
  rejected:  'bg-red-500/20 text-red-400',
  posted:    'bg-violet-500/20 text-violet-400',
}

export default async function ExpensesPage() {
  const reports = await prisma.expenseReport.findMany({
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    total:     reports.length,
    draft:     reports.filter(r => r.status === 'draft').length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    approved:  reports.filter(r => r.status === 'approved').length,
    totalAmt:  reports.reduce((s, r) => s + Number(r.totalAmount), 0),
  }

  return (
    <>
      <TopBar title="Expense Reports" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Project Operations</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Expense Reports</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{reports.length} reports total</p>
            </div>
            <Link href="/expenses/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Report
              </Button>
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Reports',  value: stats.total.toString(),             color: 'text-zinc-100' },
              { label: 'Draft',          value: stats.draft.toString(),             color: 'text-zinc-400' },
              { label: 'Submitted',      value: stats.submitted.toString(),         color: 'text-blue-400' },
              { label: 'Approved',       value: stats.approved.toString(),          color: 'text-emerald-400' },
              { label: 'Total Amount',   value: formatCurrency(stats.totalAmt),     color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <Receipt className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">All Reports</span>
            <span className="text-[10px] text-zinc-600">({reports.length})</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Table */}
          {reports.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12 text-zinc-600">
              <Receipt className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-[13px] text-zinc-500 mb-4">No expense reports yet.</p>
              <Link href="/expenses/new">
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                  <Plus className="w-3.5 h-3.5" /> New Report
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Report No', 'Title', 'Employee', 'Project', 'Category', 'Lines', 'Total', 'Status', ''].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                            h === 'Report No' || h === 'Title' ? 'text-left' : h === '' ? 'text-right' : 'text-right'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {reports.map(report => (
                      <tr key={report.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/expenses/${report.id}`} className="font-mono text-[11px] text-blue-400 hover:underline">
                            {report.reportNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100 max-w-[180px] truncate">{report.title}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-400">
                          {report.employeeId ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-400">
                          {report.projectId
                            ? <Link href={`/projects/${report.projectId}`} className="text-blue-400 hover:underline">{report.projectId.slice(0, 8)}</Link>
                            : <span className="text-zinc-700">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-400">
                          {report.category?.name ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-400">{report._count.lines}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">
                          {formatCurrency(Number(report.totalAmount))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STATUS_COLOR[report.status] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/expenses/${report.id}`} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
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
