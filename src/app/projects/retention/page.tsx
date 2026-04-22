import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { PiggyBank } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  holding:  'bg-yellow-500/20 text-yellow-400',
  partial:  'bg-blue-500/20 text-blue-400',
  released: 'bg-emerald-500/20 text-emerald-400',
}

export default async function RetentionPage() {
  const schedules = await prisma.vendorRetentionSchedule.findMany({
    include: {
      project: { select: { projectNo: true, description: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const kpi = {
    totalHeld:      schedules.reduce((s, r) => s + r.heldAmount, 0),
    dueForRelease:  schedules.filter(r => r.releaseDate && new Date(r.releaseDate) <= now && r.status !== 'released').length,
    releasedYTD:    schedules.reduce((s, r) => s + r.releasedAmount, 0),
  }

  return (
    <>
      <TopBar title="Retention" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Vendor Retention</h2>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Held',      value: `$${kpi.totalHeld.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-yellow-400' },
              { label: 'Due for Release', value: kpi.dueForRelease,  color: 'text-red-400' },
              { label: 'Released YTD',    value: `$${kpi.releasedYTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-emerald-400' },
            ].map(k => (
              <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phase</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Held</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Released</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Release Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">No retention schedules yet</td>
                  </tr>
                )}
                {schedules.map(r => (
                  <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-300">{r.project.projectNo} — {r.project.description}</td>
                    <td className="px-4 py-3 text-zinc-400">{r.phase ?? '—'}</td>
                    <td className="px-4 py-3 text-yellow-400 text-right font-mono">
                      ${r.heldAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-emerald-400 text-right font-mono">
                      ${r.releasedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {r.releaseDate ? new Date(r.releaseDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[r.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status !== 'released' && (
                        <Link
                          href={`/api/projects/retention/${r.id}`}
                          className="text-emerald-400 hover:text-emerald-300 text-xs"
                        >
                          Release
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
