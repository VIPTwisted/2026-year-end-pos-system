export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { AuditLogTable } from '@/components/audit/AuditLogTable'

// Tables shown in the filter label strip
const TABLE_FILTERS = ['Orders', 'Products', 'Customers', 'Users', 'Other'] as const

async function getStats() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())

  const [eventsToday, eventsThisWeek, allLogs] = await Promise.all([
    prisma.auditLog.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.auditLog.findMany({
      select: { tableName: true },
    }),
  ])

  // Most active table
  const tableCount = allLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.tableName] = (acc[log.tableName] ?? 0) + 1
    return acc
  }, {})
  const mostActiveTable =
    Object.entries(tableCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  return { eventsToday, eventsThisWeek, mostActiveTable }
}

export default async function AuditLogPage() {
  const [stats, records] = await Promise.all([
    getStats(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ])

  return (
    <>
      <TopBar
        title="Audit Log"
        breadcrumb={[{ label: 'Settings', href: '/settings' }]}
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="px-6 py-4 space-y-5 max-w-7xl">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
              >
                <ChevronLeft className="w-3 h-3" />
                Back to Settings
              </Link>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Audit Log</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">
                Last {records.length} system events — create, update, delete, login, and void
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Events Today</div>
              <div className="text-2xl font-bold text-zinc-100">{stats.eventsToday.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 mt-1">since midnight</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Events This Week</div>
              <div className="text-2xl font-bold text-zinc-100">{stats.eventsThisWeek.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 mt-1">since Sunday</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Most Active Table</div>
              <div className="text-2xl font-bold text-zinc-100 font-mono truncate">{stats.mostActiveTable}</div>
              <div className="text-xs text-zinc-500 mt-1">by event count</div>
            </div>
          </div>

          {/* Filter label strip (display only — data is pre-loaded server-side) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 mr-1">Tables</span>
            {TABLE_FILTERS.map((label) => (
              <span
                key={label}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800/60 text-zinc-400 border border-zinc-700/30"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">
              Events ({records.length})
            </span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Table — client component handles expand/collapse */}
          <AuditLogTable records={records} />

        </div>
      </main>
    </>
  )
}
