export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { OppStatusActions } from './OppStatusActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  open: 'default',
  won: 'success',
  lost: 'destructive',
  cancelled: 'secondary',
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const opp = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      contact: true,
      customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      salesCycle: { include: { stages: { orderBy: { stageOrder: 'asc' } } } },
    },
  })

  if (!opp) notFound()

  const currentStage = opp.salesCycle?.stages.find(s => s.id === opp.currentStageId)

  return (
    <>
      <TopBar title={opp.title} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/crm">
          <Button variant="outline" size="sm">← Back to Pipeline</Button>
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold text-zinc-100">{opp.title}</span>
                  <Badge variant={STATUS_VARIANT[opp.status] ?? 'secondary'} className="capitalize">
                    {opp.status}
                  </Badge>
                </div>
                {opp.assignedTo && (
                  <p className="text-sm text-zinc-400">Assigned to: <span className="text-zinc-300">{opp.assignedTo}</span></p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span>Created: <span className="text-zinc-300">{formatDate(opp.createdAt)}</span></span>
                  <span>Updated: <span className="text-zinc-300">{formatDate(opp.updatedAt)}</span></span>
                  {opp.expectedCloseDate && (
                    <span>Expected Close: <span className="text-amber-400">{formatDate(opp.expectedCloseDate)}</span></span>
                  )}
                </div>
                {opp.notes && (
                  <p className="text-xs text-zinc-500 italic mt-1">{opp.notes}</p>
                )}
              </div>

              {/* Value + Probability */}
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Est. Value</p>
                  <p className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(opp.estimatedValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Probability</p>
                  <p className={`text-2xl font-bold tabular-nums ${opp.probability >= 70 ? 'text-emerald-400' : opp.probability >= 40 ? 'text-amber-400' : 'text-zinc-300'}`}>
                    {opp.probability.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage Progression */}
        {opp.salesCycle && (
          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Sales Cycle: {opp.salesCycle.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {opp.salesCycle.stages.map(stage => {
                const isCurrent = stage.id === opp.currentStageId
                const isPast = opp.salesCycle!.stages.findIndex(s => s.id === opp.currentStageId) > opp.salesCycle!.stages.findIndex(s => s.id === stage.id)
                return (
                  <div
                    key={stage.id}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium ${
                      isCurrent
                        ? 'bg-blue-600/20 border-blue-600 text-blue-300'
                        : isPast
                        ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <span>{stage.stageOrder}. {stage.name}</span>
                    <span className="ml-1.5 opacity-60">({stage.probability.toFixed(0)}%)</span>
                  </div>
                )
              })}
            </div>
            {currentStage && (
              <p className="text-xs text-zinc-500 mt-2">
                Current stage: <span className="text-zinc-300">{currentStage.name}</span>
              </p>
            )}
          </section>
        )}

        {/* Contact / Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {opp.contact && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Contact</h4>
                <p className="font-medium text-zinc-100">{opp.contact.firstName} {opp.contact.lastName}</p>
                {opp.contact.title && <p className="text-xs text-zinc-500">{opp.contact.title}</p>}
                {opp.contact.company && <p className="text-xs text-zinc-400">{opp.contact.company}</p>}
                {opp.contact.email && <p className="text-xs text-zinc-500 mt-1">{opp.contact.email}</p>}
                {opp.contact.phone && <p className="text-xs text-zinc-500">{opp.contact.phone}</p>}
              </CardContent>
            </Card>
          )}
          {opp.customer && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Customer</h4>
                <Link href={`/customers/${opp.customer.id}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">
                  {opp.customer.firstName} {opp.customer.lastName}
                </Link>
                {opp.customer.email && <p className="text-xs text-zinc-500 mt-1">{opp.customer.email}</p>}
                {opp.customer.phone && <p className="text-xs text-zinc-500">{opp.customer.phone}</p>}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status Actions */}
        {opp.status === 'open' && (
          <OppStatusActions oppId={opp.id} />
        )}
      </main>
    </>
  )
}
