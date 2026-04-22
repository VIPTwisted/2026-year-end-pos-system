import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LeaveRequestActions from './LeaveRequestActions'

export default async function LeaveRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { leaveType: true, fmlaDetails: true },
  })
  if (!request) notFound()

  const employee = await prisma.employee.findUnique({
    where: { id: request.employeeId },
    select: { firstName: true, lastName: true },
  })

  const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning', approved: 'success', denied: 'destructive', cancelled: 'secondary',
  }

  const FMLA_REASON_LABELS: Record<string, string> = {
    serious_health_condition: 'Serious Health Condition',
    family_care: 'Family Member Care',
    military_exigency: 'Military Exigency',
    military_caregiver: 'Military Caregiver',
    birth_adoption: 'Birth, Adoption, or Foster Placement',
  }

  return (
    <>
      <TopBar title={`Leave Request ${request.requestNo}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">{request.requestNo}</h1>
              <Badge variant={STATUS_VARIANT[request.status] ?? 'secondary'}>{request.status}</Badge>
              {request.isFmla && <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">FMLA</span>}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {employee ? `${employee.lastName}, ${employee.firstName}` : request.employeeId} &middot; {request.leaveType.name}
            </p>
          </div>
          <LeaveRequestActions requestId={id} currentStatus={request.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Start Date', value: new Date(request.startDate).toLocaleDateString() },
            { label: 'End Date', value: new Date(request.endDate).toLocaleDateString() },
            { label: 'Hours Requested', value: `${request.hours}h`, color: 'text-blue-400' },
            { label: 'Half Day', value: request.halfDay ? 'Yes' : 'No' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-zinc-500 uppercase mb-1">{k.label}</p>
                <p className={`text-lg font-bold ${k.color ?? 'text-zinc-100'}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">Request Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-zinc-500">Leave Type: </span><span className="text-zinc-200">{request.leaveType.name} ({request.leaveType.category})</span></div>
              <div><span className="text-zinc-500">Paid: </span><span className={request.leaveType.isPaid ? 'text-emerald-400' : 'text-red-400'}>{request.leaveType.isPaid ? 'Yes' : 'No'}</span></div>
              <div><span className="text-zinc-500">Submitted: </span><span className="text-zinc-200">{new Date(request.createdAt).toLocaleDateString()}</span></div>
              {request.approvedBy && <div><span className="text-zinc-500">Approved By: </span><span className="text-zinc-200">{request.approvedBy}</span></div>}
              {request.approvedAt && <div><span className="text-zinc-500">Approved At: </span><span className="text-zinc-200">{new Date(request.approvedAt).toLocaleDateString()}</span></div>}
              {request.denialReason && <div className="col-span-2"><span className="text-zinc-500">Denial Reason: </span><span className="text-red-400">{request.denialReason}</span></div>}
              {request.reason && <div className="col-span-2"><span className="text-zinc-500">Employee Reason: </span><span className="text-zinc-300">{request.reason}</span></div>}
            </div>
          </CardContent>
        </Card>

        {/* FMLA Details */}
        {request.isFmla && request.fmlaDetails && (
          <Card className="border border-purple-500/20">
            <CardContent className="pt-4 pb-4 space-y-3">
              <h3 className="text-sm font-semibold text-purple-300">FMLA Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-zinc-500">FMLA Reason: </span><span className="text-zinc-200">{FMLA_REASON_LABELS[request.fmlaDetails.fmlaReason] ?? request.fmlaDetails.fmlaReason}</span></div>
                <div><span className="text-zinc-500">Certification Required: </span>
                  <Badge variant={request.fmlaDetails.certificationRequired ? 'warning' : 'secondary'}>{request.fmlaDetails.certificationRequired ? 'Yes' : 'No'}</Badge>
                </div>
                <div><span className="text-zinc-500">Certification Received: </span>
                  <Badge variant={request.fmlaDetails.certificationReceived ? 'success' : 'secondary'}>{request.fmlaDetails.certificationReceived ? 'Yes' : 'Pending'}</Badge>
                </div>
                {request.fmlaDetails.certificationDueDate && (
                  <div><span className="text-zinc-500">Cert Due: </span><span className="text-zinc-200">{new Date(request.fmlaDetails.certificationDueDate).toLocaleDateString()}</span></div>
                )}
                {request.fmlaDetails.isEligible !== null && request.fmlaDetails.isEligible !== undefined && (
                  <div><span className="text-zinc-500">FMLA Eligible: </span>
                    <Badge variant={request.fmlaDetails.isEligible ? 'success' : 'destructive'}>{request.fmlaDetails.isEligible ? 'Eligible' : 'Not Eligible'}</Badge>
                  </div>
                )}
                <div><span className="text-zinc-500">Intermittent: </span><span className="text-zinc-200">{request.fmlaDetails.intermittent ? 'Yes' : 'No'}</span></div>
                <div><span className="text-zinc-500">Reduced Schedule: </span><span className="text-zinc-200">{request.fmlaDetails.reducedSchedule ? 'Yes' : 'No'}</span></div>
                {request.fmlaDetails.hoursApproved !== null && request.fmlaDetails.hoursApproved !== undefined && (
                  <div><span className="text-zinc-500">Hours Approved: </span><span className="text-blue-400 font-medium">{request.fmlaDetails.hoursApproved}h</span></div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
