import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import {
  UserPlus, ClipboardList, CalendarDays, UserX, ArrowLeftRight,
  Users, AlertCircle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PersonnelWorkspacePage() {
  const now = new Date()
  const sixtyDaysOut = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)

  const [allEmployees, recentHires] = await Promise.all([
    prisma.employee.findMany({
      select: { id: true, firstName: true, lastName: true, position: true, department: true, hireDate: true, isActive: true },
      orderBy: { hireDate: 'desc' },
    }),
    prisma.employee.findMany({
      where: { hireDate: { gte: tenDaysAgo } },
      select: { id: true, firstName: true, lastName: true, position: true, department: true, hireDate: true },
      orderBy: { hireDate: 'desc' },
      take: 10,
    }),
  ])

  const totalHeadcount = allEmployees.length
  const activeEmployees = allEmployees.filter(e => e.isActive).length

  const actionTiles = [
    { label: 'Hire Employee', href: '/hr/employees/new', icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Create Requisition', href: '/hr/recruiting/requisitions/new', icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Schedule Review', href: '/hr/performance/reviews/new', icon: CalendarDays, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Process Termination', href: '/hr/employees?action=terminate', icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Transfer Employee', href: '/hr/employees?action=transfer', icon: ArrowLeftRight, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ]

  // Employees needing review (no active goals / hired 30+ days ago with no performance data)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const pendingActions = allEmployees
    .filter(e => e.isActive && new Date(e.hireDate) <= thirtyDaysAgo)
    .slice(0, 10)

  return (
    <>
      <TopBar title="Personnel Workspace" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div>
          <h1 className="text-[18px] font-semibold text-zinc-100">Personnel Workspace</h1>
          <p className="text-[13px] text-zinc-500">Workforce management, actions, and visibility</p>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Headcount', value: totalHeadcount, color: 'text-zinc-100' },
            { label: 'Active Employees', value: activeEmployees, color: 'text-emerald-400' },
            { label: 'Open Requisitions', value: 0, color: 'text-blue-400' },
            { label: 'Pending Hires', value: 0, color: 'text-amber-400' },
            { label: 'Expiring Contracts', value: 0, color: 'text-red-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Action tiles */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2 mb-4">Personnel Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {actionTiles.map(a => (
              <Link
                key={a.label}
                href={a.href}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-lg border ${a.bg} hover:brightness-110 transition-all text-center`}
              >
                <a.icon className={`w-6 h-6 ${a.color}`} />
                <span className="text-[12px] text-zinc-300 leading-tight font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Two tables side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Pending Actions */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h2 className="text-[15px] font-semibold text-zinc-100">Pending Manager Review</h2>
              {pendingActions.length > 0 && (
                <span className="ml-auto bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] px-1.5 py-0.5 rounded-full">{pendingActions.length}</span>
              )}
            </div>
            {pendingActions.length === 0 ? (
              <div className="py-10 text-center text-zinc-600 text-[13px]">No pending actions</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employee</th>
                      <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Position</th>
                      <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Dept</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingActions.map(e => (
                      <tr key={e.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-2.5">
                          <Link href={`/hr/employees/${e.id}`} className="text-zinc-200 hover:text-blue-400 font-medium transition-colors">
                            {e.lastName}, {e.firstName}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-400 text-[12px]">{e.position}</td>
                        <td className="px-3 py-2.5 text-zinc-500 text-[12px]">{e.department ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expiring Contracts */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <h2 className="text-[15px] font-semibold text-zinc-100">Expiring Contracts</h2>
              <span className="ml-auto text-[12px] text-zinc-500">within 60 days</span>
            </div>
            <div className="py-10 text-center text-zinc-600 text-[13px]">
              No contracts expiring within 60 days
            </div>
          </div>

        </div>

        {/* Recent Hires */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h2 className="text-[15px] font-semibold text-zinc-100">Recent Hires</h2>
            </div>
            <Link href="/hr/employees" className="text-[12px] text-blue-400 hover:underline">View all employees</Link>
          </div>
          {recentHires.length === 0 ? (
            <div className="py-10 text-center text-zinc-600 text-[13px]">No recent hires in the last 10 days</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employee</th>
                    <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Position</th>
                    <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Department</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHires.map(e => (
                    <tr key={e.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5">
                        <Link href={`/hr/employees/${e.id}`} className="font-medium text-zinc-200 hover:text-blue-400 transition-colors">
                          {e.lastName}, {e.firstName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{e.position}</td>
                      <td className="px-3 py-2.5 text-zinc-500">{e.department ?? '—'}</td>
                      <td className="px-5 py-2.5 text-zinc-500">{new Date(e.hireDate).toLocaleDateString()}</td>
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
