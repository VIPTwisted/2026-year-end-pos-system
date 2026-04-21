import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock, Ban } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'secondary',
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; entityType?: string }>
}) {
  const { status, entityType } = await searchParams

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (entityType) where.entityType = entityType

  const [requests, counts] = await Promise.all([
    prisma.approvalRequest.findMany({
      where,
      include: {
        workflow: { select: { id: true, name: true } },
        actions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.approvalRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ])

  const kpi = { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
  for (const c of counts) {
    if (c.status in kpi) kpi[c.status as keyof typeof kpi] = c._count.id
  }

  return (
    <>
      <TopBar title="Approval Workflows" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: kpi.pending, icon: Clock, color: 'text-amber-400' },
            { label: 'Approved', value: kpi.approved, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Rejected', value: kpi.rejected, icon: XCircle, color: 'text-red-400' },
            { label: 'Cancelled', value: kpi.cancelled, icon: Ban, color: 'text-zinc-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-5 flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                  <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter + Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {['', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
              <Link key={s} href={s ? `/approvals?status=${s}` : '/approvals'}>
                <Button variant={status === s || (!status && s === '') ? 'default' : 'outline'} size="sm" className="capitalize">
                  {s || 'All'}
                </Button>
              </Link>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href="/approvals/workflows">
              <Button variant="outline" size="sm">Manage Workflows</Button>
            </Link>
            <Link href="/approvals/workflows/new">
              <Button size="sm">+ New Workflow</Button>
            </Link>
          </div>
        </div>

        {/* Requests Table */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-zinc-600">
              <Clock className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No approval requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Ref</th>
                  <th className="text-left pb-3 font-medium">Entity Type</th>
                  <th className="text-left pb-3 font-medium">Workflow</th>
                  <th className="text-left pb-3 font-medium">Requested By</th>
                  <th className="text-center pb-3 font-medium">Step</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Created</th>
                  <th className="text-right pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-zinc-100 font-medium">{r.entityRef}</span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs uppercase tracking-wide">
                      {r.entityType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">{r.workflow.name}</td>
                    <td className="py-3 pr-4 text-zinc-400">{r.requestedBy}</td>
                    <td className="py-3 pr-4 text-center text-zinc-400 tabular-nums">{r.currentStep}</td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={STATUS_VARIANT[r.status] ?? 'secondary'} className="capitalize">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 text-xs">{formatDate(r.createdAt)}</td>
                    <td className="py-3 text-right">
                      <Link href={`/approvals/${r.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
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
