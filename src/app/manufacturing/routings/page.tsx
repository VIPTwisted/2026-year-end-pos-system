import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { GitBranch, ArrowLeft } from 'lucide-react'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    certified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    closed: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40 opacity-60',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default async function RoutingsPage() {
  const routings = await prisma.routing.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lines: true } } },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Routings" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <Link
          href="/manufacturing"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Manufacturing
        </Link>

        {/* Page header: title + count + New button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Routings</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {routings.length}
            </span>
          </div>
          <Link href="/manufacturing/routings/new">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              + New Routing
            </button>
          </Link>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Routing #', 'Description', 'Operations', 'Type', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                    No routings.{' '}
                    <Link href="/manufacturing/routings/new" className="text-blue-400 hover:text-blue-300 hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                routings.map(r => (
                  <tr key={r.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/manufacturing/routings/${r.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                        {r.routingNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{r.description}</td>
                    <td className="px-4 py-2 text-zinc-400">{r._count.lines}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize bg-zinc-700/40 text-zinc-400 border-zinc-600/40">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <StatusChip status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
