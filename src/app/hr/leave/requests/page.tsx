import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  pending: 'warning', approved: 'success', denied: 'destructive', cancelled: 'secondary',
}

export default async function LeaveRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; fmla?: string }>
}) {
  const { status, fmla } = await searchParams
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (fmla === 'true') where.isFmla = true

  const requests = await prisma.leaveRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const empIds = [...new Set(requests.map(r => r.employeeId).filter(Boolean) as string[])]
  const employees = empIds.length > 0
    ? await prisma.employee.findMany({
        where: { id: { in: empIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : []
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  const STATUSES = ['pending', 'approved', 'denied', 'cancelled']

  return (
    <>
      <TopBar title="Leave Requests" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Leave Requests</h1>
            <p className="text-[13px] text-zinc-500">{requests.length} requests</p>
          </div>
          <Link
            href="/hr/leave/requests/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/hr/leave/requests">
            <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${!status && !fmla ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>All</span>
          </Link>
          {STATUSES.map(s => (
            <Link key={s} href={`/hr/leave/requests?status=${s}`}>
              <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium capitalize cursor-pointer transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>{s}</span>
            </Link>
          ))}
          <Link href="/hr/leave/requests?fmla=true">
            <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${fmla === 'true' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>FMLA Only</span>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <p className="text-[13px]">No leave requests found</p>
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
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Days</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Hours</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">FMLA</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2">
                        <Link href={`/hr/leave/requests/${r.id}`} className="font-mono text-blue-400 hover:underline text-[12px]">
                          {r.requestNo.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-semibold text-zinc-100">
                        {empMap[r.employeeId ?? ''] ?? r.employeeName}
                      </td>
                      <td className="px-3 py-2 text-zinc-400">{r.leaveTypeName}</td>
                      <td className="px-3 py-2 text-zinc-500">{new Date(r.startDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-zinc-500">{new Date(r.endDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-right text-zinc-300">{r.days}d</td>
                      <td className="px-3 py-2 text-right text-zinc-300">{r.hours}h</td>
                      <td className="px-3 py-2 text-center">
                        {r.isFmla && (
                          <span className="rounded-full px-2 py-0.5 text-[11px] bg-purple-500/20 text-purple-400 border border-purple-500/30">FMLA</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={STATUS_VARIANT[r.status] ?? 'secondary'}>{r.status}</Badge>
                      </td>
                      <td className="px-5 py-2 text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</td>
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
