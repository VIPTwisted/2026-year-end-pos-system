import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, ListChecks } from 'lucide-react'

export const dynamic = 'force-dynamic'

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  monthly: 'Monthly',
  annually: 'Annually',
}

export default async function LeaveAccrualsPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [plans, enrollments] = await Promise.all([
    prisma.leaveAccrualPlan.findMany({ orderBy: { name: 'asc' } }),
    prisma.leaveAccrualEnrollment.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  const activePlans = plans.filter(p => p.isActive).length
  const enrolledEmployees = new Set(enrollments.map(e => e.employeeId)).size
  const accrualsThisMonth = enrollments.filter(
    e => new Date(e.createdAt) >= monthStart
  ).length

  // Enrollment count per plan
  const enrollCountByPlan = Object.fromEntries(
    plans.map(p => [p.id, enrollments.filter(e => e.planId === p.id).length])
  )

  // Recent accrual runs = enrollments modified this month (proxy)
  const recentRuns = enrollments.filter(
    e => new Date(e.updatedAt) >= monthStart
  ).slice(0, 15)

  // Fetch employee names for recent runs
  const empIds = [...new Set(recentRuns.map(r => r.employeeId))]
  const employees = empIds.length > 0
    ? await prisma.employee.findMany({
        where: { id: { in: empIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : []
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  return (
    <>
      <TopBar title="Leave Accruals" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Leave Accrual Plans</h1>
            <p className="text-[13px] text-zinc-500">Configure accrual plans and track employee balances</p>
          </div>
          <Link
            href="/hr/leave-absence/accruals/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Plan
          </Link>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Active Plans', value: activePlans, color: 'text-blue-400' },
            { label: 'Enrolled Employees', value: enrolledEmployees, color: 'text-emerald-400' },
            { label: 'Accruals Run This Month', value: accrualsThisMonth, color: 'text-purple-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Accrual Plans table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50">
            <h2 className="text-[15px] font-semibold text-zinc-100">Accrual Plans</h2>
          </div>
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-zinc-500">
              <ListChecks className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No accrual plans configured yet</p>
              <Link href="/hr/leave-absence/accruals/new" className="mt-2 text-[13px] text-blue-400 hover:underline">
                Create your first plan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Plan Name</th>
                    <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Frequency</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Accrual Amt</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Max Balance</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Wait Days</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Enrolled</th>
                    <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5 font-medium text-zinc-200">{p.name}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{FREQ_LABELS[p.accrualFrequency] ?? p.accrualFrequency}</td>
                      <td className="px-3 py-2.5 text-right text-zinc-300 font-mono">{p.accrualAmount.toFixed(2)} hrs</td>
                      <td className="px-3 py-2.5 text-right text-zinc-400 font-mono">
                        {p.maxBalance != null ? `${p.maxBalance.toFixed(0)} hrs` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right text-zinc-500">{p.waitingPeriodDays}d</td>
                      <td className="px-3 py-2.5 text-right text-zinc-300 font-semibold">{enrollCountByPlan[p.id] ?? 0}</td>
                      <td className="px-5 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          p.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-700/50 text-zinc-500 border border-zinc-700/30'
                        }`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Accrual Runs */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50">
            <h2 className="text-[15px] font-semibold text-zinc-100">Recent Accrual Activity</h2>
          </div>
          {recentRuns.length === 0 ? (
            <div className="py-10 text-center text-zinc-600 text-[13px]">No accrual activity this month</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employee</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Balance</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Total Accrued</th>
                    <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Total Used</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5 text-zinc-200 font-medium">
                        {empMap[r.employeeId] ?? r.employeeId}
                      </td>
                      <td className="px-3 py-2.5 text-right text-emerald-400 font-mono font-semibold">
                        {r.currentBalance.toFixed(2)} hrs
                      </td>
                      <td className="px-3 py-2.5 text-right text-zinc-300 font-mono">{r.totalAccrued.toFixed(2)} hrs</td>
                      <td className="px-3 py-2.5 text-right text-zinc-400 font-mono">{r.totalUsed.toFixed(2)} hrs</td>
                      <td className="px-5 py-2.5 text-zinc-500">{new Date(r.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
