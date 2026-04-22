export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeftRight, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'open' } = await searchParams

  const movements = await prisma.warehouseMovement.findMany({
    where: { status },
    include: {
      store: { select: { name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const tabs = [
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Warehouse Movements" />
      <main className="flex-1 p-6 space-y-5">

        {/* Action ribbon */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-1">
            {tabs.map(t => (
              <Link key={t.value} href={`/warehouse/movements?status=${t.value}`}>
                <button className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${status === t.value ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
                  {t.label}
                </button>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 transition-colors">
              Print
            </button>
            <Link href="/warehouse/movements/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Movement
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {movements.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowLeftRight className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-[13px]">No {status.replace(/_/g, ' ')} movements</p>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">No.</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Location</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Assigned User ID</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Description</th>
                  <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Status</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">No. of Lines</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Created</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/warehouse/movements/${m.id}`} className="font-mono text-[13px] font-semibold text-blue-400 hover:text-blue-300 hover:underline">
                        {m.movementNo}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-400 font-mono text-xs">{m.locationCode ?? m.store?.name ?? '—'}</td>
                    <td className="px-4 py-2 text-zinc-400">{m.assignedUserId ?? '—'}</td>
                    <td className="px-4 py-2 text-zinc-400 text-xs">{m.description ?? '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <StatusChip status={m.status} />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-zinc-300">{m._count.lines}</td>
                    <td className="px-4 py-2 text-right text-zinc-600">{formatDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
