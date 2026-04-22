export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  pending: 'warning', approved: 'success', denied: 'destructive', cancelled: 'secondary',
}

export default async function LeaveRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const request = await prisma.leaveRequest.findUnique({ where: { id } })
  if (!request) notFound()

  const employee = request.employeeId
    ? await prisma.employee.findUnique({
        where: { id: request.employeeId },
        select: { firstName: true, lastName: true, department: true, position: true },
      })
    : null

  const balance = request.employeeId
    ? await prisma.leaveBalance.findFirst({ where: { employeeId: request.employeeId, year: new Date().getFullYear() } })
    : null

  const displayNo = request.requestNo.slice(0, 8).toUpperCase()

  return (
    <>
      <TopBar title={`Leave Request ${displayNo}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-zinc-100 font-mono">{displayNo}</h1>
              <Badge variant={STATUS_VARIANT[request.status] ?? 'secondary'}>{request.status}</Badge>
              {request.isFmla && (
                <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">FMLA</span>
              )}
              {request.halfDay && (
                <span className="px-2 py-0.5 rounded text-xs bg-zinc-700 text-zinc-400 font-medium">Half Day</span>
              )}
            </div>
            <p className="text-[13px] text-zinc-500">
              {employee ? `${employee.lastName}, ${employee.firstName}` : request.employeeName}
              {' · '}{request.leaveTypeName}
            </p>
          </div>
          <Link
            href="/hr/leave/requests"
            className="text-[12px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md transition-colors"
          >
            Back to Requests
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Start Date', value: new Date(request.startDate).toLocaleDateString() },
            { label: 'End Date', value: new Date(request.endDate).toLocaleDateString() },
            { label: 'Days', value: `${request.days}d`, color: 'text-blue-400' },
            { label: 'Hours', value: `${request.hours}h`, color: 'text-blue-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.color ?? 'text-zinc-100'}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Employee & leave details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Employee</p>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Name</span>
                <span className="text-zinc-200 font-medium">{employee ? `${employee.firstName} ${employee.lastName}` : request.employeeName}</span>
              </div>
              {employee?.department && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Department</span>
                  <span className="text-zinc-200">{employee.department}</span>
                </div>
              )}
              {employee?.position && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Position</span>
                  <span className="text-zinc-200">{employee.position}</span>
                </div>
              )}
              {balance && (
                <>
                  <div className="border-t border-zinc-800/50 pt-2 mt-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Leave Balances ({balance.year})</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Vacation</span>
                    <span className="text-emerald-400">{(balance.vacationTotal - balance.vacationUsed).toFixed(1)}d avail</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Sick</span>
                    <span className="text-emerald-400">{(balance.sickTotal - balance.sickUsed).toFixed(1)}d avail</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Personal</span>
                    <span className="text-emerald-400">{(balance.personalTotal - balance.personalUsed).toFixed(1)}d avail</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Request Details</p>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Leave Type</span>
                <span className="text-zinc-200">{request.leaveTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <Badge variant={STATUS_VARIANT[request.status] ?? 'secondary'}>{request.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Submitted</span>
                <span className="text-zinc-400">{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
              {request.approvedBy && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Approved By</span>
                  <span className="text-zinc-200">{request.approvedBy}</span>
                </div>
              )}
              {request.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Approved At</span>
                  <span className="text-zinc-400">{new Date(request.approvedAt).toLocaleDateString()}</span>
                </div>
              )}
              {request.rejectionReason && (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-zinc-500">Denial Reason</span>
                  <span className="text-red-400">{request.rejectionReason}</span>
                </div>
              )}
              {request.reason && (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-zinc-500">Employee Reason</span>
                  <span className="text-zinc-300">{request.reason}</span>
                </div>
              )}
              {request.managerNotes && (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-zinc-500">Manager Notes</span>
                  <span className="text-zinc-300">{request.managerNotes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FMLA details */}
        {request.isFmla && (
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest text-purple-400 border-b border-purple-500/20 pb-1 mb-3">FMLA Information</p>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">FMLA Case</span>
                <span className="text-zinc-200 font-mono">{request.fmlaCase ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">FMLA Eligible</span>
                <Badge variant="success">Eligible</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {request.status === 'pending' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Actions</p>
            <p className="text-[13px] text-zinc-400 mb-3">Use the API to approve or deny this request:</p>
            <div className="flex gap-3">
              <form action={`/api/hr/leave/requests/${id}/approve`} method="POST">
                <button type="submit"
                  className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-medium transition-colors">
                  Approve
                </button>
              </form>
              <form action={`/api/hr/leave/requests/${id}/deny`} method="POST">
                <button type="submit"
                  className="px-4 py-2 rounded-md bg-red-600/80 hover:bg-red-600 text-white text-[13px] font-medium transition-colors">
                  Deny
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
