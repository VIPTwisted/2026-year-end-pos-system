export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WorkOrderActions from './WorkOrderActions'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  new:         'secondary',
  assigned:    'default',
  in_progress: 'warning',
  on_hold:     'outline',
  completed:   'success',
  cancelled:   'destructive',
}

const PRIORITY_VARIANT: Record<string, 'default' | 'destructive' | 'warning' | 'secondary'> = {
  critical: 'destructive',
  high:     'warning',
  medium:   'default',
  low:      'secondary',
}

const LINE_TYPE_STYLE: Record<string, string> = {
  labor:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
  part:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  expense: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

export default async function WorkOrderDetailPage({ params }: Props) {
  const { id } = await params

  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      store:    true,
      customer: true,
      lines:    { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!wo) notFound()

  const totalCost = wo.lines.reduce((s, l) => s + l.totalCost, 0)

  return (
    <>
      <TopBar title={`Work Order ${wo.woNumber}`} />
      <main className="flex-1 p-6 space-y-5 overflow-auto">

        {/* Back */}
        <Link
          href="/field-service"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Field Service
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <span className="font-mono text-xs text-zinc-500">{wo.woNumber}</span>
              <h1 className="text-xl font-bold text-zinc-100">{wo.title}</h1>
              <Badge variant={STATUS_VARIANT[wo.status] ?? 'secondary'}>
                {wo.status.replace('_', ' ')}
              </Badge>
              <Badge variant={PRIORITY_VARIANT[wo.priority] ?? 'default'}>
                {wo.priority}
              </Badge>
            </div>
            {wo.description && (
              <p className="text-sm text-zinc-400 max-w-2xl">{wo.description}</p>
            )}
          </div>

          <WorkOrderActions
            workOrderId={wo.id}
            currentStatus={wo.status}
          />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Store</div>
              <div className="text-sm font-medium text-zinc-100">{wo.store?.name ?? '—'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Customer</div>
              <div className="text-sm font-medium text-zinc-100">
                {wo.customer ? `${wo.customer.firstName} ${wo.customer.lastName}` : '—'}
              </div>
              {wo.customer?.email && (
                <div className="text-xs text-zinc-500 truncate">{wo.customer.email}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Assigned To</div>
              <div className="text-sm font-medium text-zinc-100">{wo.assignedTo ?? '—'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Scheduled</div>
              <div className="text-sm font-medium text-zinc-100">
                {wo.scheduledAt ? formatDate(wo.scheduledAt) : '—'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Est. Hours</div>
              <div className="text-sm font-medium text-zinc-100">
                {wo.estimatedHrs != null ? `${wo.estimatedHrs} hrs` : '—'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Actual Hours</div>
              <div className="text-sm font-medium text-zinc-100">
                {wo.actualHrs != null ? `${wo.actualHrs} hrs` : '—'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Created</div>
              <div className="text-sm font-medium text-zinc-100">{formatDate(wo.createdAt)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Completed</div>
              <div className="text-sm font-medium text-zinc-100">
                {wo.completedAt ? formatDate(wo.completedAt) : '—'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Order Lines */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Work Order Lines
                <span className="ml-2 text-zinc-500 font-normal text-xs">({wo.lines.length} items)</span>
              </CardTitle>
              {totalCost > 0 && (
                <div className="text-sm font-bold text-emerald-400">
                  Total: {formatCurrency(totalCost)}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {wo.lines.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-zinc-500">
                No lines yet. Add labor, parts, or expenses using the form below.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
                      <th className="text-left px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Qty</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Unit Cost</th>
                      <th className="text-right px-5 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wo.lines.map(line => (
                      <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${LINE_TYPE_STYLE[line.lineType] ?? LINE_TYPE_STYLE.expense}`}>
                            {line.lineType}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-zinc-200">{line.description}</td>
                        <td className="px-3 py-3 text-right text-zinc-400">{line.quantity}</td>
                        <td className="px-3 py-3 text-right text-zinc-400 font-mono text-xs">
                          {formatCurrency(line.unitCost)}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-zinc-100">
                          {formatCurrency(line.totalCost)}
                        </td>
                      </tr>
                    ))}
                    {wo.lines.length > 0 && (
                      <tr className="border-t border-zinc-700 bg-zinc-900/50">
                        <td colSpan={4} className="px-5 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wide">
                          Total Cost
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-400">
                          {formatCurrency(totalCost)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {wo.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{wo.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions — Add Line + Status */}
        <WorkOrderActions
          workOrderId={wo.id}
          currentStatus={wo.status}
          showAddLine
        />

      </main>
    </>
  )
}
