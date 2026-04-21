import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeadphonesIcon, CheckCircle2, Clock, ShieldAlert, BarChart3 } from 'lucide-react'

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
  const [cases, totalCases, resolvedCases, slaCases, casesByPriority] = await Promise.all([
    prisma.serviceCase.findMany({
      include: { customer: true, notes: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.serviceCase.count(),
    prisma.serviceCase.count({ where: { status: 'resolved' } }),
    prisma.serviceCase.count({ where: { slaBreached: true } }),
    prisma.serviceCase.groupBy({ by: ['priority'], _count: { id: true } }),
  ])

  const totalOpen        = cases.filter(c => c.status === 'open').length
  const totalInProgress  = cases.filter(c => c.status === 'in_progress').length
  const totalSlaBreached = cases.filter(c => c.slaBreached === true).length

  // Resolution rate
  const resolutionRate  = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0
  const slaCompliance   = totalCases > 0 ? ((totalCases - slaCases) / totalCases) * 100 : 100

  function resolutionColor(rate: number): string {
    if (rate >= 70) return 'text-emerald-400'
    if (rate >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  function slaColor(rate: number): string {
    return rate >= 90 ? 'text-emerald-400' : 'text-amber-400'
  }

  // Priority order for display
  const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low']
  const priorityMap = Object.fromEntries(casesByPriority.map(p => [p.priority, p._count.id]))

  return (
    <>
      <TopBar title="Customer Service" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-4 gap-4">
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

        {/* ── Case Management Table ── */}
        <section>
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
        </section>

        {/* ── Case Resolution Stats (D365 Knowledge/Analytics) ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Case Resolution Stats</h2>
            <p className="text-sm text-zinc-500">D365-style knowledge base analytics across all {totalCases} cases</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            {/* Resolution rate */}
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Resolution Rate</p>
                </div>
                <p className={`text-3xl font-bold tabular-nums ${resolutionColor(resolutionRate)}`}>
                  {resolutionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  {resolvedCases} of {totalCases} resolved
                  {resolutionRate >= 70 && <span className="ml-1 text-emerald-600">· on target</span>}
                  {resolutionRate >= 50 && resolutionRate < 70 && <span className="ml-1 text-amber-600">· needs attention</span>}
                  {resolutionRate < 50 && <span className="ml-1 text-red-600">· below threshold</span>}
                </p>
              </CardContent>
            </Card>

            {/* SLA compliance */}
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-zinc-400" />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">SLA Compliance</p>
                </div>
                <p className={`text-3xl font-bold tabular-nums ${slaColor(slaCompliance)}`}>
                  {slaCompliance.toFixed(1)}%
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  {slaCases} breach{slaCases !== 1 ? 'es' : ''} · target &gt;90%
                  {slaCompliance >= 90 && <span className="ml-1 text-emerald-600">· compliant</span>}
                </p>
              </CardContent>
            </Card>

            {/* Avg resolution time stub */}
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Resolution Time</p>
                </div>
                <p className="text-3xl font-bold text-zinc-500 tabular-nums">—</p>
                <p className="text-xs text-zinc-600 mt-1">hrs avg resolution · tracking pending</p>
              </CardContent>
            </Card>
          </div>

          {/* Priority breakdown */}
          <Card>
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Cases by Priority</h3>
              </div>
              <span className="text-xs text-zinc-500">{totalCases} total</span>
            </div>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                {PRIORITY_ORDER.map(priority => {
                  const count = priorityMap[priority] ?? 0
                  return (
                    <div key={priority} className="flex items-center gap-1.5">
                      <Badge variant={PRIORITY_VARIANT[priority] ?? 'secondary'} className="capitalize">
                        {priority}
                      </Badge>
                      <span className="text-sm font-semibold text-zinc-200 tabular-nums">{count}</span>
                    </div>
                  )
                })}
                {/* Any unlisted priorities from DB */}
                {casesByPriority
                  .filter(p => !PRIORITY_ORDER.includes(p.priority))
                  .map(p => (
                    <div key={p.priority} className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="capitalize">{p.priority}</Badge>
                      <span className="text-sm font-semibold text-zinc-200 tabular-nums">{p._count.id}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </section>

      </main>
    </>
  )
}
