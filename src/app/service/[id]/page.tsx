export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CaseActions } from './CaseActions'
import { MessageSquare, Lock, Globe } from 'lucide-react'

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'secondary',
}

const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success' | 'secondary'> = {
  open: 'warning',
  in_progress: 'default',
  resolved: 'success',
  closed: 'secondary',
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const serviceCase = await prisma.serviceCase.findUnique({
    where: { id },
    include: {
      customer: true,
      notes: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!serviceCase) notFound()

  return (
    <>
      <TopBar title={`Case ${serviceCase.caseNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-mono text-zinc-100">
                    {serviceCase.caseNumber}
                  </span>
                  <Badge variant={STATUS_VARIANT[serviceCase.status] ?? 'secondary'}>
                    {serviceCase.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={PRIORITY_VARIANT[serviceCase.priority] ?? 'secondary'}>
                    {serviceCase.priority}
                  </Badge>
                  {serviceCase.slaBreached && (
                    <Badge variant="destructive">SLA Breached</Badge>
                  )}
                </div>

                <div className="text-sm text-zinc-400">
                  <span className="font-semibold text-zinc-200">
                    {serviceCase.customer.firstName} {serviceCase.customer.lastName}
                  </span>
                  {serviceCase.customer.email && (
                    <span className="text-zinc-500 ml-2">{serviceCase.customer.email}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mt-1">
                  <span>
                    Opened:{' '}
                    <span className="text-zinc-300">{formatDate(serviceCase.createdAt)}</span>
                  </span>
                  {serviceCase.category && (
                    <span>
                      Category:{' '}
                      <span className="text-zinc-300 capitalize">{serviceCase.category}</span>
                    </span>
                  )}
                  {serviceCase.assignedTo && (
                    <span>
                      Assigned:{' '}
                      <span className="text-zinc-300">{serviceCase.assignedTo}</span>
                    </span>
                  )}
                  {serviceCase.resolvedAt && (
                    <span>
                      Resolved:{' '}
                      <span className="text-emerald-400">{formatDate(serviceCase.resolvedAt)}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-zinc-600 uppercase tracking-wide">Notes</p>
                <p className="text-3xl font-bold text-zinc-200 tabular-nums">
                  {serviceCase.notes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {serviceCase.description && (
          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Description
            </h3>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {serviceCase.description}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Actions (status update + add note) */}
        <CaseActions caseId={serviceCase.id} currentStatus={serviceCase.status} />

        {/* Notes Timeline */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Notes Timeline
          </h3>

          {serviceCase.notes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <MessageSquare className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm">No notes yet — add the first one above.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {serviceCase.notes.map(note => (
                <Card key={note.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-zinc-200">
                          {note.authorId ?? 'System'}
                        </span>
                        <span className="text-xs text-zinc-600">{formatDate(note.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {note.isPublic ? (
                          <Badge variant="default" className="text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Internal
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

      </main>
    </>
  )
}
