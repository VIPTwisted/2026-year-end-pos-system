import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

interface FiscalPeriodRow {
  id: string
  status: string
}

interface FiscalYearRow {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: string
  closedAt: Date | null
  periods: FiscalPeriodRow[]
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function FiscalYearsPage() {
  const years: FiscalYearRow[] = await prisma.fiscalYear.findMany({
    include: {
      periods: {
        select: { id: true, status: true },
        orderBy: { periodNumber: 'asc' },
      },
    },
    orderBy: { startDate: 'desc' },
  })

  // Determine the current active year (most recent open)
  const activeId = years.find((y) => y.status === 'open')?.id ?? null

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Fiscal Periods"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <Link
            href="/finance/fiscal-years/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            + Create Fiscal Year
          </Link>
        }
      />

      <main className="max-w-5xl mx-auto w-full p-6 space-y-4">
        {years.length === 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-10 text-center">
            <p className="text-zinc-500 text-sm">No fiscal years created yet.</p>
            <Link
              href="/finance/fiscal-years/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Create First Fiscal Year
            </Link>
          </div>
        )}

        {years.map((year) => {
          const closedCount = year.periods.filter((p) => p.status === 'closed').length
          const totalCount = year.periods.length
          const pct = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0
          const isActive = year.id === activeId

          return (
            <div
              key={year.id}
              className={`bg-[#16213e] border rounded-lg p-5 ${
                isActive
                  ? 'border-blue-500/40 ring-1 ring-blue-500/20'
                  : 'border-zinc-800/50'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-zinc-100">{year.name}</span>
                      {isActive && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 uppercase tracking-widest">
                          Active
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          year.status === 'open'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-700/60 text-zinc-400'
                        }`}
                      >
                        {year.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatDate(year.startDate)} — {formatDate(year.endDate)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/finance/fiscal-years/${year.id}`}
                  className="shrink-0 inline-flex items-center px-3 py-1.5 text-[12px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors"
                >
                  View Periods
                </Link>
              </div>

              {/* Progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Periods Closed
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {closedCount} / {totalCount}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
