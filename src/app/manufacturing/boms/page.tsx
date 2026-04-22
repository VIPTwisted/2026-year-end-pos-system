import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Layers, ArrowLeft } from 'lucide-react'

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

const ALL_STATUSES = ['new', 'certified', 'closed']

export default async function BOMsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const boms = await prisma.productionBOM.findMany({
    where: status && ALL_STATUSES.includes(status) ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      outputProduct: { select: { name: true, sku: true } },
      _count: { select: { lines: true } },
    },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Bills of Material" />
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
            <Layers className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Bills of Material</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {boms.length}
            </span>
          </div>
          <Link href="/manufacturing/boms/new">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              + New BOM
            </button>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', ...ALL_STATUSES].map(s => (
            <Link
              key={s}
              href={s ? `/manufacturing/boms?status=${s}` : '/manufacturing/boms'}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                (s === '' && !status) || status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['BOM #', 'Description', 'Output Product', 'Lines', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                    No BOMs found.{' '}
                    <Link href="/manufacturing/boms/new" className="text-blue-400 hover:text-blue-300 hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                boms.map(bom => (
                  <tr key={bom.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/manufacturing/boms/${bom.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                        {bom.bomNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{bom.description}</td>
                    <td className="px-4 py-2">
                      {bom.outputProduct ? (
                        <div>
                          <p className="text-zinc-300">{bom.outputProduct.name}</p>
                          <p className="text-[11px] text-zinc-600">{bom.outputProduct.sku}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-zinc-400">{bom._count.lines}</td>
                    <td className="px-4 py-2">
                      <StatusChip status={bom.status} />
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
