import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeadphonesIcon } from 'lucide-react'

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

export default async function ServicePage() {
  const cases = await prisma.serviceCase.findMany({
    include: { customer: true, notes: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const totalOpen = cases.filter(c => c.status === 'open').length
  const totalInProgress = cases.filter(c => c.status === 'in_progress').length
  const totalSlaBreached = cases.filter(c => c.slaBreached === true).length

  return (
    <>
      <TopBar title="Customer Service" />
      <main className="flex-1 p-6 overflow-auto">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Cases</p>
              <p className="text-2xl font-bold text-zinc-100">{cases.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open</p>
              <p className="text-2xl font-bold text-amber-400">{totalOpen}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{totalInProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">SLA Breached</p>
              <p className="text-2xl font-bold text-red-400">{totalSlaBreached}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Case Management</h2>
          <p className="text-sm text-zinc-500">{cases.length} cases</p>
        </div>

        {cases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <HeadphonesIcon className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No cases yet</p>
              <p className="text-sm">Support cases will appear here once submitted</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Case #</th>
                  <th className="text-left pb-3 font-medium">Created</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Subject</th>
                  <th className="text-left pb-3 font-medium">Category</th>
                  <th className="text-center pb-3 font-medium">Priority</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-center pb-3 font-medium">SLA</th>
                  <th className="text-right pb-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {cases.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{c.caseNumber}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {c.customer
                        ? `${c.customer.firstName} ${c.customer.lastName}`
                        : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300 max-w-[200px] truncate" title={c.subject}>
                      {c.subject}
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 capitalize text-xs">
                      {c.category || <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={PRIORITY_VARIANT[c.priority] ?? 'secondary'}>
                        {c.priority}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={STATUS_VARIANT[c.status] ?? 'secondary'}>
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {c.slaBreached ? (
                        <Badge variant="destructive">BREACH</Badge>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-zinc-400">
                      {c.notes.length > 0 ? (
                        <span className="text-zinc-300 font-medium">{c.notes.length}</span>
                      ) : (
                        <span className="text-zinc-700">0</span>
                      )}
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
