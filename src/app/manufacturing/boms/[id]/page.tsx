export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Layers, Package } from 'lucide-react'

const STATUS_CHIP: Record<string, string> = {
  new: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  certified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  closed: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40 opacity-60',
}

const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

export default async function BOMDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const bom = await prisma.productionBOM.findUnique({
    where: { id },
    include: {
      outputProduct: { select: { id: true, name: true, sku: true } },
      lines: {
        include: { component: { select: { id: true, name: true, sku: true, unit: true } } },
        orderBy: { lineNo: 'asc' },
      },
    },
  })

  if (!bom) notFound()

  const chipCls = STATUS_CHIP[bom.status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={bom.bomNumber} />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800/60 bg-[#12121f] px-4 py-2 flex items-center gap-1">
          <Link href="/manufacturing/boms">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>
          </Link>
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className={sectionCls}>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${chipCls}`}>
                      {bom.status}
                    </span>
                  </div>
                  <h1 className="text-lg font-bold text-zinc-100 font-mono">{bom.bomNumber}</h1>
                  <p className="text-sm text-zinc-400 mt-0.5">{bom.description}</p>
                  <div className="flex gap-4 mt-2 text-[11px] text-zinc-600">
                    <span>UOM: {bom.unitOfMeasure}</span>
                    <span>{bom.lines.length} component{bom.lines.length !== 1 ? 's' : ''}</span>
                    <span>Version: 1</span>
                    <span>Last Modified: {new Date(bom.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {bom.outputProduct && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Package className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-zinc-500">Output Product:</span>
                      <span className="text-zinc-300">{bom.outputProduct.name}</span>
                      <span className="text-zinc-600 font-mono">({bom.outputProduct.sku})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lines FastTab */}
          <div className={sectionCls}>
            <div className={tabHeaderCls}>
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              Lines ({bom.lines.length})
            </div>
            {bom.lines.length === 0 ? (
              <p className="px-5 py-6 text-xs text-zinc-600">No component lines defined.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['#', 'Type', 'No.', 'Description', 'Quantity', 'Unit of Measure', 'Scrap %'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-600 font-medium tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bom.lines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-600">{line.lineNo}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 capitalize">
                          {line.type?.replace(/_/g, ' ') ?? 'Item'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-zinc-400">{line.component.sku}</td>
                      <td className="px-4 py-2.5 text-zinc-300">{line.component.name}</td>
                      <td className="px-4 py-2.5 text-zinc-100 font-semibold tabular-nums">{line.quantity}</td>
                      <td className="px-4 py-2.5 text-zinc-500">{line.unitOfMeasure}</td>
                      <td className="px-4 py-2.5 text-zinc-500">
                        {line.scrapPct > 0 ? `${line.scrapPct}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
