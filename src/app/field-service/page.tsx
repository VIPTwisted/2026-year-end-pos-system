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

  const newCount = workOrders.filter(wo => wo.status === 'new').length
  const inProgressCount = workOrders.filter(wo => wo.status === 'in_progress').length
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length

  return (
    <>
      <TopBar title="Field Service" />
      <main className="flex-1 p-6 overflow-auto">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
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
        </div>

        {/* Table */}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {workOrders.map(wo => (
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
                      {wo.scheduledAt ? formatDate(wo.scheduledAt) : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400">
                      {wo.estimatedHrs != null ? wo.estimatedHrs : '—'}
                    </td>
                    <td className="py-3 text-right text-zinc-400">
                      {wo.actualHrs != null ? wo.actualHrs : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
