import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, MessageSquare } from 'lucide-react'

const PRIORITY_BADGE: Record<string, string> = {
  urgent: 'bg-red-500/15 text-red-400 border border-red-500/30',
  high:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  normal: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  low:    'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
}

const STATUS_BADGE: Record<string, string> = {
  open:        'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  in_progress: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  resolved:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  closed:      'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
}

export default async function ServiceCasesPage() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [cases, openCount, highPriorityCount, resolvedThisWeek] = await Promise.all([
    prisma.serviceCase.findMany({
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.serviceCase.count({ where: { status: 'open' } }),
    prisma.serviceCase.count({
      where: { priority: { in: ['high', 'urgent'] }, status: { not: 'closed' } },
    }),
    prisma.serviceCase.count({
      where: { status: 'resolved', resolvedAt: { gte: weekAgo } },
    }),
  ])

  // Avg resolution time (hours) for resolved cases with resolvedAt
  const resolvedCases = await prisma.serviceCase.findMany({
    where: { status: 'resolved', resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true },
  })
  const avgResolutionHours =
    resolvedCases.length > 0
      ? resolvedCases.reduce((acc, c) => {
          const ms = (c.resolvedAt as Date).getTime() - c.createdAt.getTime()
          return acc + ms / 3_600_000
        }, 0) / resolvedCases.length
      : 0

  const stats = [
    { label: 'Open Cases',         value: openCount.toString(),                  accent: 'bg-blue-500' },
    { label: 'High Priority',       value: highPriorityCount.toString(),          accent: 'bg-red-500' },
    { label: 'Resolved This Week',  value: resolvedThisWeek.toString(),           accent: 'bg-emerald-500' },
    { label: 'Avg Resolution Time', value: `${avgResolutionHours.toFixed(1)}h`,  accent: 'bg-amber-500' },
  ]

  const filters = [
    { label: 'All',         href: '/crm/service-cases' },
    { label: 'Open',        href: '/crm/service-cases?status=open' },
    { label: 'In Progress', href: '/crm/service-cases?status=in_progress' },
    { label: 'Resolved',    href: '/crm/service-cases?status=resolved' },
  ]

  return (
    <>
      <TopBar title="Service Cases" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Service Cases</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{cases.length} cases · {openCount} open</p>
          </div>
          <Link
            href="/crm/service-cases/new"
            className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />New Case
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className={`h-[3px] w-full ${s.accent}`} />
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter badges */}
        <div className="flex items-center gap-2 mb-5">
          {filters.map(f => (
            <Link
              key={f.label}
              href={f.href}
              className="px-3 py-1 rounded-full text-[12px] font-medium border border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        {cases.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
            <MessageSquare className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-[13px]">No service cases yet.</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Case #</th>
                    <th className="text-left py-2.5 font-medium">Subject</th>
                    <th className="text-left py-2.5 font-medium">Customer</th>
                    <th className="text-left py-2.5 font-medium">Priority</th>
                    <th className="text-left py-2.5 font-medium">Status</th>
                    <th className="text-left py-2.5 font-medium">Assigned To</th>
                    <th className="text-left py-2.5 font-medium">Created</th>
                    <th className="text-left py-2.5 font-medium">Updated</th>
                    <th className="text-right px-4 py-2.5 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== cases.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-zinc-400 text-[11px]">{c.caseNumber}</td>
                      <td className="py-2.5 pr-4 text-zinc-100 font-medium max-w-[220px] truncate">{c.title}</td>
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/customers/${c.customer.id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {c.customer.firstName} {c.customer.lastName}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${PRIORITY_BADGE[c.priority] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_BADGE[c.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-500 text-[12px]">
                        {c.assignedTo ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-500 text-[11px]">{formatDate(c.createdAt)}</td>
                      <td className="py-2.5 pr-4 text-zinc-500 text-[11px]">{formatDate(c.updatedAt)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          href={`/crm/service-cases/${c.id}`}
                          className="text-[11px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 px-2.5 py-1 rounded transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
