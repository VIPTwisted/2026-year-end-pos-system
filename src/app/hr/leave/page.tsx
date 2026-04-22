import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, Plus } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  pending: 'warning', approved: 'success', denied: 'destructive', cancelled: 'secondary',
}

export default async function LeavePage() {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [allRequests, leaveTypes] = await Promise.all([
    prisma.leaveRequest.findMany({
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.leaveType.findMany({ orderBy: { name: 'asc' } }),
  ])

  const pending = allRequests.filter(r => r.status === 'pending')
  const approvedThisMonth = allRequests.filter(r =>
    r.status === 'approved' && r.approvedAt && new Date(r.approvedAt) >= monthStart
  ).length
  const hoursYtd = allRequests
    .filter(r => r.status === 'approved' && new Date(r.startDate) >= yearStart)
    .reduce((s, r) => s + r.hours, 0)
  const fmlaOpen = allRequests.filter(r => r.isFmla && r.status !== 'denied' && r.status !== 'cancelled').length

  const statusBreakdown = ['pending', 'approved', 'denied', 'cancelled'].map(s => ({
    status: s,
    count: allRequests.filter(r => r.status === s).length,
  }))

  const empIds = [...new Set(allRequests.map(r => r.employeeId))]
  const employees = await prisma.employee.findMany({
    where: { id: { in: empIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-500', approved: 'bg-emerald-500', denied: 'bg-red-500', cancelled: 'bg-zinc-500',
  }

  return (
    <>
      <TopBar title="Leave & Absence" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Leave &amp; Absence</h1>
            <p className="text-[13px] text-zinc-500">Requests, balances, FMLA, and leave types</p>
          </div>
          <Link
            href="/hr/leave/requests/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open Requests', value: pending.length, color: pending.length > 0 ? 'text-amber-400' : 'text-zinc-100' },
            { label: 'Approved This Month', value: approvedThisMonth, color: 'text-emerald-400' },
            { label: 'Total Hours Used YTD', value: `${hoursYtd.toFixed(0)}h`, color: 'text-blue-400' },
            { label: 'FMLA Cases Open', value: fmlaOpen, color: fmlaOpen > 0 ? 'text-red-400' : 'text-zinc-100' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Requests by Status</p>
          <div className="flex gap-4">
            {statusBreakdown.map(s => (
              <div key={s.status} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s.status]}`} />
                <span className="text-[13px] text-zinc-400 capitalize">{s.status}</span>
                <span className="text-[13px] font-bold text-zinc-200">{s.count}</span>
              </div>
            ))}
          </div>
          {allRequests.length > 0 && (
            <div className="mt-3 flex h-1.5 rounded-full overflow-hidden">
              {statusBreakdown.filter(s => s.count > 0).map(s => (
                <div key={s.status} className={STATUS_COLORS[s.status]} style={{ width: `${(s.count / allRequests.length) * 100}%` }} />
              ))}
            </div>
          )}
        </div>

        {/* Pending requests */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold text-zinc-100">Pending Requests</h2>
              {pending.length > 0 && (
                <span className="bg-amber-500 text-white text-[11px] rounded-full px-1.5 py-0.5 font-medium">{pending.length}</span>
              )}
            </div>
            <Link href="/hr/leave/requests?status=pending" className="text-[12px] text-blue-400 hover:underline">View all</Link>
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <CalendarCheck className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No pending requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Request #</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employee</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Leave Type</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Start</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">End</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Hours</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">FMLA</th>
                    <th className="text-center px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.slice(0, 10).map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2">
                        <Link href={`/hr/leave/requests/${r.id}`} className="font-mono text-blue-400 hover:underline text-[12px]">{r.requestNo}</Link>
                      </td>
                      <td className="px-3 py-2 font-semibold text-zinc-100">{empMap[r.employeeId] ?? r.employeeId}</td>
                      <td className="px-3 py-2 text-zinc-400">{r.leaveType.name}</td>
                      <td className="px-3 py-2 text-zinc-500">{new Date(r.startDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-zinc-500">{new Date(r.endDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-right text-zinc-300">{r.hours}h</td>
                      <td className="px-3 py-2 text-center">
                        {r.isFmla && (
                          <span className="rounded-full px-2 py-0.5 text-[11px] bg-purple-500/20 text-purple-400 border border-purple-500/30">FMLA</span>
                        )}
                      </td>
                      <td className="px-5 py-2 text-center">
                        <Badge variant={STATUS_VARIANT[r.status] ?? 'secondary'}>{r.status}</Badge>
                      </td>
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
