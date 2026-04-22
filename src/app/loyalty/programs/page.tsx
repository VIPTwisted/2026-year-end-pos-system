import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Settings } from 'lucide-react'

export default async function LoyaltyProgramsPage() {
  const programs = await prisma.loyaltyProgram.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tiers: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { cards: true } },
    },
  })

  return (
    <>
      <TopBar title="Loyalty Programs" />
      <main className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh]">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Loyalty Programs</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{programs.length} program{programs.length !== 1 ? 's' : ''} configured</p>
          </div>
          <Link
            href="/loyalty/programs/new"
            className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Program
          </Link>
        </div>

        {programs.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-500">
            <Settings className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-[13px] font-medium text-zinc-300 mb-1">No programs yet</p>
            <p className="text-[13px] mb-4">Create your first loyalty program to get started</p>
            <Link
              href="/loyalty/programs/new"
              className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Program
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">Program Name</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-right py-3 font-medium">Members</th>
                    <th className="text-right py-3 font-medium">Tiers</th>
                    <th className="text-left py-3 font-medium">Date Range</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== programs.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-100">{p.name}</div>
                        {p.description && <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{p.description}</div>}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          p.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-700/50 text-zinc-400 border-zinc-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums font-mono">
                        {p._count.cards.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex gap-1 justify-end">
                          {p.tiers.slice(0, 4).map(t => (
                            <span
                              key={t.id}
                              className="w-3 h-3 rounded-full inline-block"
                              style={{ backgroundColor: t.color ?? '#71717a' }}
                              title={t.name}
                            />
                          ))}
                          {p.tiers.length === 0 && <span className="text-zinc-600">—</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[11px] text-zinc-500">
                        {p.startDate
                          ? new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'
                        }
                        {p.endDate && (
                          <> → {new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                        )}
                        {!p.startDate && !p.endDate && 'No date range'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/loyalty/programs/${p.id}`}
                          className="text-blue-400 hover:text-blue-300 text-[12px] transition-colors"
                        >
                          View →
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
