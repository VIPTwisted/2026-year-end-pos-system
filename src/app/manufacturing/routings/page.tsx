export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { GitBranch, ChevronRight, RefreshCw } from 'lucide-react'

const STATUS_CHIP: Record<string, string> = {
  new: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  certified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  closed: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40 opacity-60',
}

function StatusChip({ status }: { status: string }) {
  const cls = STATUS_CHIP[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
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
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800/60 bg-[#12121f] px-4 py-2 flex items-center gap-1">
          <Link href="/manufacturing/routings/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              + New
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
            Edit
          </button>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          <Link href="/manufacturing/routings">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </Link>
        </div>

        <div className="p-5 space-y-4">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-zinc-400" />
              <h1 className="text-sm font-semibold text-zinc-200">Routings</h1>
              <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
                {routings.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['No.', 'Description', 'Status', 'Version', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-zinc-600">
                      No routings found.{' '}
                      <Link href="/manufacturing/routings/new" className="text-blue-400 hover:text-blue-300 hover:underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  routings.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/50 transition-colors group">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/manufacturing/routings/${r.id}`}
                          className="font-mono text-[13px] font-medium text-zinc-100 group-hover:text-blue-300 transition-colors"
                        >
                          {r.routingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">{r.description}</td>
                      <td className="px-4 py-2.5">
                        <StatusChip status={r.status} />
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 font-mono text-xs">1</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link href={`/manufacturing/routings/${r.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
