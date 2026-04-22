import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Building2, Plus } from 'lucide-react'

function runStatusCls(status: string): string {
  if (status === 'complete') return 'bg-emerald-500/20 text-emerald-400'
  if (status === 'failed') return 'bg-red-500/20 text-red-400'
  return 'bg-amber-500/20 text-amber-400'
}

export default async function ConsolidationPage() {
  const groups = await prisma.consolidationGroup.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      companies: { where: { isActive: true } },
      runs: { orderBy: { runDate: 'desc' }, take: 1 },
    },
  })

  const totalCompanies = groups.reduce((s, g) => s + g.companies.length, 0)
  const lastRun = groups
    .flatMap(g => g.runs)
    .sort((a, b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime())[0]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Multi-Company Consolidation" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">Consolidation Groups</h2>
            <p className="text-[13px] text-zinc-500">
              {groups.length} groups · {totalCompanies} companies ·
              {lastRun ? ` Last run ${formatDate(lastRun.runDate)}` : ' No runs yet'}
            </p>
          </div>
          <Link
            href="/finance/consolidation/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 h-9 text-[13px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Group
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-500">
            <Building2 className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-[13px]">No consolidation groups yet — create one to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(g => {
              const latestRun = g.runs[0]
              return (
                <Link key={g.id} href={`/finance/consolidation/${g.id}`}>
                  <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 hover:border-zinc-600 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-400" />
                      </div>
                      {latestRun && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${runStatusCls(latestRun.status)}`}>
                          {latestRun.status}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[13px] font-semibold text-zinc-100 mb-1">{g.name}</h3>
                    {g.description && (
                      <p className="text-[11px] text-zinc-500 mb-3 line-clamp-2">{g.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-3 border-t border-zinc-800/50">
                      <span>{g.companies.length} companies · {g.currency}</span>
                      {latestRun && (
                        <span>{formatDate(latestRun.runDate)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
