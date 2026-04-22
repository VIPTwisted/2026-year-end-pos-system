export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Plus } from 'lucide-react'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700 text-zinc-400',
    submitted: 'bg-blue-500/10 text-blue-400',
    approved: 'bg-emerald-500/10 text-emerald-400',
    rejected: 'bg-red-500/10 text-red-400',
    paid: 'bg-purple-500/10 text-purple-400',
  }
  const cls = map[status] ?? 'bg-zinc-700 text-zinc-400'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const now = new Date()
  const ytdStart = new Date(now.getFullYear(), 0, 1)

  const [reports, totalSubmitted, pendingApproval, approvedUnpaid, paidYTD] = await Promise.all([
    prisma.employeeExpenseReport.findMany({
      where: status ? { status } : undefined,
      include: {
        employee: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.employeeExpenseReport.count({ where: { status: 'submitted' } }),
    prisma.employeeExpenseReport.count({ where: { status: 'submitted' } }),
    prisma.employeeExpenseReport.count({ where: { status: 'approved' } }),
    prisma.employeeExpenseReport.aggregate({
      where: { status: 'paid', paidAt: { gte: ytdStart } },
      _sum: { totalAmount: true },
    }),
  ])

  const TABS = [
    { key: '', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'paid', label: 'Paid' },
  ]

  return (
    <>
      <TopBar title="Expense Reports" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Employee Expense Reports</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Manage and approve employee expense submissions</p>
            </div>
            <Link
              href="/hr/expenses/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Expense Report
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Submitted</div>
              <div className="text-2xl font-bold text-blue-400">{totalSubmitted}</div>
              <div className="text-xs text-zinc-500 mt-1">awaiting review</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Pending Approval</div>
              <div className="text-2xl font-bold text-amber-400">{pendingApproval}</div>
              <div className="text-xs text-zinc-500 mt-1">needs manager action</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Approved Unpaid</div>
              <div className="text-2xl font-bold text-emerald-400">{approvedUnpaid}</div>
              <div className="text-xs text-zinc-500 mt-1">ready for reimbursement</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Paid YTD</div>
              <div className="text-2xl font-bold text-purple-400">{formatCurrency(paidYTD._sum.totalAmount ?? 0)}</div>
              <div className="text-xs text-zinc-500 mt-1">reimbursed this year</div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map(t => (
              <Link
                key={t.key}
                href={t.key ? `/hr/expenses?status=${t.key}` : '/hr/expenses'}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  (status ?? '') === t.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Report #', 'Employee', 'Title', 'Amount', 'Status', 'Submitted', 'Approved By'].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-zinc-500">
                        No expense reports found
                      </td>
                    </tr>
                  )}
                  {reports.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/hr/expenses/${r.id}`}
                          className="font-mono text-[12px] text-blue-400 hover:text-blue-300"
                        >
                          {r.reportNo}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-zinc-200">
                        {r.employee.firstName} {r.employee.lastName}
                      </td>
                      <td className="px-5 py-3 text-zinc-300 max-w-[200px] truncate">{r.title}</td>
                      <td className="px-5 py-3 font-semibold tabular-nums text-zinc-200">
                        {formatCurrency(r.totalAmount)}
                      </td>
                      <td className="px-5 py-3">{statusBadge(r.status)}</td>
                      <td className="px-5 py-3 text-zinc-400 text-[13px]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3 text-zinc-400 text-[13px]">
                        {r.approvedBy ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
