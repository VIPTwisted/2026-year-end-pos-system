export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import InjuryActions from './InjuryActions'

export default async function InjuryCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const injuryCase = await prisma.injuryCase.findUnique({ where: { id } })
  if (!injuryCase) notFound()

  const employee = await prisma.employee.findUnique({
    where: { id: injuryCase.employeeId },
    select: { firstName: true, lastName: true },
  })

  const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success'> = {
    open: 'warning', investigating: 'default', closed: 'success',
  }

  return (
    <>
      <TopBar title={`Case ${injuryCase.caseNo}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">{injuryCase.caseNo}</h1>
              <Badge variant={STATUS_VARIANT[injuryCase.status] ?? 'secondary'}>{injuryCase.status}</Badge>
              {injuryCase.oshaRecordable && (
                <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-medium">OSHA 300</span>
              )}
              {injuryCase.recordable && !injuryCase.oshaRecordable && (
                <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">Recordable</span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {employee ? `${employee.lastName}, ${employee.firstName}` : injuryCase.employeeId} &middot; {new Date(injuryCase.incidentDate).toLocaleDateString()}
            </p>
          </div>
          <InjuryActions caseId={id} currentStatus={injuryCase.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Injury Type', value: injuryCase.injuryType.replace(/_/g, ' ') },
            { label: 'Severity', value: injuryCase.severity.replace(/_/g, ' '), color: injuryCase.severity === 'fatality' ? 'text-red-400' : injuryCase.severity === 'lost_time' ? 'text-orange-400' : 'text-zinc-100' },
            { label: 'Days Lost', value: injuryCase.daysLost, color: injuryCase.daysLost > 0 ? 'text-orange-400' : 'text-zinc-100' },
            { label: 'Body Part', value: injuryCase.bodyPart ?? '—' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-zinc-500 uppercase mb-1">{k.label}</p>
                <p className={`text-lg font-bold capitalize ${k.color ?? 'text-zinc-100'}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">Incident Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {injuryCase.location && <div><span className="text-zinc-500">Location: </span><span className="text-zinc-200">{injuryCase.location}</span></div>}
              <div><span className="text-zinc-500">Reported: </span><span className="text-zinc-200">{new Date(injuryCase.reportedDate).toLocaleDateString()}</span></div>
              {injuryCase.witnesses && <div><span className="text-zinc-500">Witnesses: </span><span className="text-zinc-200">{injuryCase.witnesses}</span></div>}
            </div>
            <div><span className="text-zinc-500 text-sm">Description: </span><p className="text-zinc-300 text-sm mt-1">{injuryCase.description}</p></div>
            {injuryCase.treatment && <div><span className="text-zinc-500 text-sm">Treatment: </span><p className="text-zinc-300 text-sm mt-1">{injuryCase.treatment}</p></div>}
          </CardContent>
        </Card>

        {/* Investigation */}
        {(injuryCase.rootCause || injuryCase.correctiveAction || injuryCase.status !== 'open') && (
          <Card className={injuryCase.status === 'closed' ? 'border-emerald-500/20' : 'border-blue-500/20'}>
            <CardContent className="pt-4 pb-4 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-200">Investigation</h3>
              {injuryCase.rootCause && (
                <div><span className="text-zinc-500 text-sm">Root Cause: </span><p className="text-zinc-300 text-sm mt-1">{injuryCase.rootCause}</p></div>
              )}
              {injuryCase.correctiveAction && (
                <div><span className="text-zinc-500 text-sm">Corrective Action: </span><p className="text-zinc-300 text-sm mt-1">{injuryCase.correctiveAction}</p></div>
              )}
              {injuryCase.closedAt && (
                <div className="text-sm"><span className="text-zinc-500">Closed: </span><span className="text-emerald-400">{new Date(injuryCase.closedAt).toLocaleDateString()}</span></div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
