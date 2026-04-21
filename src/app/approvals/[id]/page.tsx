import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ApprovalActionPanel } from './ApprovalActionPanel'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'secondary',
}

const ACTION_COLORS: Record<string, string> = {
  approve: 'text-emerald-400',
  reject: 'text-red-400',
  comment: 'text-zinc-400',
}

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const request = await prisma.approvalRequest.findUnique({
    where: { id },
    include: {
      workflow: {
        include: { steps: { orderBy: { stepOrder: 'asc' } } },
      },
      actions: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!request) notFound()

  const isPending = request.status === 'pending'
  const totalSteps = request.workflow.steps.length

  return (
    <>
      <TopBar title={`Approval — ${request.entityRef}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/approvals">
          <Button variant="outline" size="sm">← Back to Approvals</Button>
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-mono text-zinc-100">{request.entityRef}</span>
                  <Badge variant="outline" className="text-xs uppercase tracking-wide">
                    {request.entityType.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant={STATUS_VARIANT[request.status] ?? 'secondary'} className="capitalize">
                    {request.status}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">
                  Workflow: <span className="text-zinc-300 font-medium">{request.workflow.name}</span>
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span>Requested by: <span className="text-zinc-300">{request.requestedBy}</span></span>
                  <span>Step: <span className="text-zinc-300">{request.currentStep} / {totalSteps}</span></span>
                  <span>Created: <span className="text-zinc-300">{formatDate(request.createdAt)}</span></span>
                  <span>Updated: <span className="text-zinc-300">{formatDate(request.updatedAt)}</span></span>
                </div>
                {request.notes && (
                  <p className="text-xs text-zinc-500 italic mt-1">{request.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Approval Steps</h3>
          <div className="flex flex-wrap gap-3">
            {request.workflow.steps.map(step => {
              const action = request.actions.find(a => a.stepOrder === step.stepOrder)
              const isCurrent = request.currentStep === step.stepOrder && isPending
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-sm ${
                    action?.action === 'approve'
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                      : action?.action === 'reject'
                      ? 'bg-red-950/30 border-red-800 text-red-300'
                      : isCurrent
                      ? 'bg-amber-950/30 border-amber-700 text-amber-300'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span className="font-mono text-xs opacity-60">{step.stepOrder}.</span>
                  <span className="capitalize font-medium">{step.approverRole}</span>
                  {step.approverName && <span className="text-xs opacity-70">({step.approverName})</span>}
                  {action && (
                    <span className={`text-xs font-semibold capitalize ml-1 ${ACTION_COLORS[action.action] ?? ''}`}>
                      {action.action}d
                    </span>
                  )}
                  {isCurrent && !action && (
                    <span className="text-xs font-semibold text-amber-400 ml-1">Awaiting</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Action History */}
        {request.actions.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Action History ({request.actions.length})
            </h3>
            <div className="space-y-3">
              {request.actions.map(action => (
                <Card key={action.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold capitalize ${ACTION_COLORS[action.action] ?? 'text-zinc-300'}`}>
                            {action.action}
                          </span>
                          <span className="text-xs text-zinc-500">Step {action.stepOrder}</span>
                          <span className="text-xs text-zinc-400">by {action.actorName}</span>
                          <Badge variant="secondary" className="text-xs capitalize">{action.actorRole}</Badge>
                        </div>
                        {action.comment && (
                          <p className="text-xs text-zinc-400 italic">{action.comment}</p>
                        )}
                      </div>
                      <span className="text-xs text-zinc-600 shrink-0">{formatDate(action.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Action Panel (approve / reject) */}
        {isPending && (
          <ApprovalActionPanel
            requestId={request.id}
            currentStep={request.currentStep}
            currentStepDef={request.workflow.steps.find(s => s.stepOrder === request.currentStep) ?? null}
          />
        )}
      </main>
    </>
  )
}
