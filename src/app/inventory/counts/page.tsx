import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700/60 text-zinc-400',
    in_progress: 'bg-amber-500/10 text-amber-400',
    completed: 'bg-blue-500/10 text-blue-400',
    posted: 'bg-emerald-500/10 text-emerald-400',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${map[status] ?? 'bg-zinc-700/60 text-zinc-400'}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

export default async function PhysicalCountsPage() {
  const counts = await prisma.physicalCount.findMany({
    include: { store: true, lines: true },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalCounts = counts.length
  const inProgress = counts.filter(c => c.status === 'in_progress').length
  const completedThisMonth = counts.filter(
    c => (c.status === 'completed' || c.status === 'posted') && new Date(c.createdAt) >= startOfMonth,
  ).length

  return (
    <>
      <TopBar title="Physical Inventory Counts" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Physical Inventory Counts</h1>
              <p className="text-xs text-zinc-500 mt-1">D365 Physical Inventory Journal — cycle count management</p>
            </div>
            <Link
              href="/inventory/counts/new"
              className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Count
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">TOTAL COUNTS</div>
              <div className="text-2xl font-bold text-zinc-100">{totalCounts}</div>
              <div className="text-xs text-zinc-500 mt-1">All time</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">IN PROGRESS</div>
              <div className="text-2xl font-bold text-amber-400">{inProgress}</div>
              <div className="text-xs text-zinc-500 mt-1">Active counts</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">COMPLETED THIS MONTH</div>
              <div className="text-2xl font-bold text-emerald-400">{completedThisMonth}</div>
              <div className="text-xs text-zinc-500 mt-1">Posted or completed</div>
            </div>
          </div>

          {/* Table */}
          {counts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-lg border border-zinc-800/50">
              <ClipboardList className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-500 mb-1">No inventory counts yet</p>
              <p className="text-xs text-zinc-600">Create your first count to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
              <table className="w-full">
                <thead className="bg-[#16213e] border-b border-zinc-800">
                  <tr>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-3 px-4">Count #</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-3 px-4">Store</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-3 px-4">Date</th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-3 px-4">Products</th>
                    <th className="text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-3 px-4">Status</th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-3 px-4">Variances</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="bg-[#16213e]">
                  {counts.map(count => {
                    const varianceCount = count.lines.filter(
                      l => l.variance !== null && l.variance !== 0,
                    ).length

                    return (
                      <tr key={count.id} className="border-t border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-4 text-sm font-mono text-zinc-200">{count.countNumber}</td>
                        <td className="py-3 px-4 text-sm text-zinc-300">{count.store.name}</td>
                        <td className="py-3 px-4 text-sm text-zinc-400">
                          {new Date(count.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right tabular-nums text-zinc-300">
                          {count.lines.length}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={count.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          {varianceCount > 0 ? (
                            <span className="flex items-center justify-end gap-1 text-amber-400 text-sm font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {varianceCount}
                            </span>
                          ) : count.status === 'posted' || count.status === 'completed' ? (
                            <span className="flex items-center justify-end gap-1 text-emerald-400 text-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              0
                            </span>
                          ) : (
                            <span className="flex items-center justify-end gap-1 text-zinc-600 text-sm">
                              <Clock className="w-3.5 h-3.5" />
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/inventory/counts/${count.id}`}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
