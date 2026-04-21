import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  new: 'secondary',
  assigned: 'default',
  in_progress: 'warning',
  on_hold: 'outline',
  completed: 'success',
  cancelled: 'destructive',
}

const PRIORITY_VARIANT: Record<string, 'default' | 'destructive' | 'warning' | 'secondary'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'secondary',
}

// Dispatch board pipeline order + colors
const PIPELINE_STAGES = [
  { key: 'new',         label: 'New',         variant: 'secondary' as const },
  { key: 'assigned',    label: 'Assigned',     variant: 'default'   as const },
  { key: 'in_progress', label: 'In Progress',  variant: 'warning'   as const },
  { key: 'on_hold',     label: 'On Hold',      variant: 'outline'   as const },
  { key: 'completed',   label: 'Completed',    variant: 'success'   as const },
]

export default async function FieldServicePage() {
  const workOrders = await prisma.workOrder.findMany({
    include: { store: true },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()

  const overdueCount = workOrders.filter(
    wo =>
      wo.scheduledAt !== null &&
      wo.scheduledAt < now &&
      wo.status !== 'completed' &&
      wo.status !== 'cancelled'
  ).length

  const newCount       = workOrders.filter(wo => wo.status === 'new').length
  const inProgressCount = workOrders.filter(wo => wo.status === 'in_progress').length
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length

  // Completion rate
  const completionRate =
    workOrders.length > 0
      ? ((completedCount / workOrders.length) * 100).toFixed(0)
      : '0'

  // Avg estimated hours
  const withEstHrs = workOrders.filter(wo => wo.estimatedHrs != null)
  const avgEstHrs =
    withEstHrs.length > 0
      ? (
          withEstHrs.reduce((sum, wo) => sum + (wo.estimatedHrs as number), 0) /
          withEstHrs.length
        ).toFixed(1)
      : null

  // Dispatch board counts per status
  const statusCounts = workOrders.reduce<Record<string, number>>((acc, wo) => {
    acc[wo.status] = (acc[wo.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <TopBar title="Field Service" />
      <main className="flex-1 p-6 overflow-auto">

        {/* KPI Row — 7 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total WOs</p>
              <p className="text-2xl font-bold text-zinc-100">{workOrders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">New</p>
              <p className="text-2xl font-bold text-zinc-100">{newCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">In Progress</p>
              <p className="text-2xl font-bold text-zinc-100">{inProgressCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Completed</p>
              <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Completion %</p>
              <p className="text-2xl font-bold text-emerald-400">{completionRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Avg Est Hrs</p>
              <p className="text-2xl font-bold text-zinc-100">
                {avgEstHrs != null ? avgEstHrs : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dispatch Board — D365 Field Service scheduling pattern */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Dispatch Board
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.key} className="flex items-center gap-2">
                <div className="min-w-[100px] p-3 rounded-lg border border-zinc-700 text-center bg-zinc-900">
                  <p className="text-xs text-zinc-500 mb-1">{stage.label}</p>
                  <p className="text-xl font-bold text-zinc-100">{statusCounts[stage.key] ?? 0}</p>
                  <div className="mt-1.5 flex justify-center">
                    <Badge variant={stage.variant} className="text-[10px] px-1.5 py-0">
                      {stage.label}
                    </Badge>
                  </div>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <span className="text-zinc-600 text-lg font-light select-none">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Work Orders Table */}
        {workOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Wrench className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No work orders yet</p>
              <p className="text-sm">Work orders will appear here once created</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">WO #</th>
                  <th className="text-left pb-3 font-medium">Created</th>
                  <th className="text-left pb-3 font-medium">Store</th>
                  <th className="text-left pb-3 font-medium">Title</th>
                  <th className="text-center pb-3 font-medium">Priority</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Assigned To</th>
                  <th className="text-left pb-3 font-medium">Scheduled</th>
                  <th className="text-right pb-3 font-medium">Est Hrs</th>
                  <th className="text-right pb-3 font-medium">Actual Hrs</th>
                  <th className="text-right pb-3 font-medium">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {workOrders.map(wo => {
                  // Efficiency: estimatedHrs / actualHrs * 100
                  let efficiencyEl: React.ReactNode = '—'
                  if (wo.estimatedHrs != null && wo.actualHrs != null && wo.actualHrs > 0) {
                    const pct = (wo.estimatedHrs / wo.actualHrs) * 100
                    const pctStr = `${pct.toFixed(0)}%`
                    const colorClass =
                      pct > 90
                        ? 'text-emerald-400'
                        : pct >= 70
                        ? 'text-amber-400'
                        : 'text-red-400'
                    efficiencyEl = <span className={colorClass}>{pctStr}</span>
                  }

                  // Scheduled date: show "(OVERDUE)" in red if past + not completed
                  const isOverdue =
                    wo.scheduledAt !== null &&
                    wo.scheduledAt < now &&
                    wo.status !== 'completed' &&
                    wo.status !== 'cancelled'

                  return (
                    <tr key={wo.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{wo.woNumber}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(wo.createdAt)}</td>
                      <td className="py-3 pr-4 text-zinc-400">{wo.store?.name ?? '—'}</td>
                      <td className="py-3 pr-4 text-zinc-100 font-medium max-w-[200px] truncate">{wo.title}</td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={PRIORITY_VARIANT[wo.priority] ?? 'default'}>{wo.priority}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={STATUS_VARIANT[wo.status] ?? 'secondary'}>
                          {wo.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{wo.assignedTo ?? '—'}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {wo.scheduledAt ? (
                          <>
                            {formatDate(wo.scheduledAt)}
                            {isOverdue && (
                              <span className="ml-1.5 text-red-400 font-medium">(OVERDUE)</span>
                            )}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400">
                        {wo.estimatedHrs != null ? wo.estimatedHrs : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400">
                        {wo.actualHrs != null ? wo.actualHrs : '—'}
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {efficiencyEl}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
