export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Layers } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Certified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Under Development': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Closed: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
      {status}
    </span>
  )
}

export default async function AssemblyBOMDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bom = await prisma.assemblyBOM.findUnique({
    where: { id },
    include: { lines: { orderBy: { lineNo: 'asc' } } },
  })
  if (!bom) notFound()

  const orderCount = await prisma.assemblyOrder.count({ where: { bomId: id } })

  return (
    <>
      <TopBar title={`BOM — ${bom.bomNo}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-6xl mx-auto p-6 space-y-6">

          <div className="flex items-center gap-3">
            <Link href="/assembly/bom" className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Assembly Management &rsaquo; BOMs</p>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-100 font-mono">{bom.bomNo}</h2>
                <StatusBadge status={bom.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main content */}
            <div className="col-span-2 space-y-4">

              {/* General FastTab */}
              <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <summary className="px-5 py-3.5 border-b border-zinc-800/50 cursor-pointer text-[12px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors select-none">
                  General
                </summary>
                <div className="p-5 grid grid-cols-2 gap-4">
                  {[
                    { label: 'BOM No.', value: bom.bomNo },
                    { label: 'Description', value: bom.description ?? '—' },
                    { label: 'Item No.', value: bom.itemNo ?? '—' },
                    { label: 'Unit of Measure', value: bom.unitOfMeasure },
                    { label: 'Version Code', value: bom.versionCode },
                    { label: 'Status', value: bom.status },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">{label}</div>
                      <div className="text-sm text-zinc-200">{value}</div>
                    </div>
                  ))}
                </div>
              </details>

              {/* BOM Lines FastTab */}
              <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <summary className="px-5 py-3.5 border-b border-zinc-800/50 cursor-pointer text-[12px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors select-none">
                  BOM Lines ({bom.lines.length})
                </summary>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-zinc-800/60">
                      <tr>
                        {['Line', 'Type', 'Component No.', 'Description', 'Qty per', 'UoM', 'Lead Time'].map(h => (
                          <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${h === 'Qty per' || h === 'Lead Time' ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {bom.lines.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-zinc-600 text-sm">No component lines</td>
                        </tr>
                      ) : bom.lines.map(l => (
                        <tr key={l.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-600">{l.lineNo}</td>
                          <td className="px-4 py-3 text-[12px] text-zinc-400">{l.type}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-blue-400">{l.componentNo ?? '—'}</td>
                          <td className="px-4 py-3 text-sm text-zinc-200">{l.description ?? '—'}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-zinc-200">{l.qtyPer}</td>
                          <td className="px-4 py-3 text-[12px] text-zinc-400">{l.unitOfMeasure}</td>
                          <td className="px-4 py-3 text-right text-[12px] text-zinc-500">{l.leadTimeDays}d</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>

            {/* FactBox sidebar */}
            <div className="space-y-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">BOM Statistics</div>
                <div className="space-y-3">
                  {[
                    { label: 'Component Lines', value: bom.lines.length },
                    { label: 'Assembly Orders', value: orderCount },
                    { label: 'Version Code', value: bom.versionCode },
                    { label: 'Active', value: bom.isActive ? 'Yes' : 'No' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{label}</span>
                      <span className="text-xs font-semibold text-zinc-200 tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Actions</div>
                <div className="space-y-2">
                  <Link href={`/assembly/orders/new?bomId=${bom.id}&itemNo=${encodeURIComponent(bom.itemNo ?? '')}`}>
                    <button className="w-full h-8 rounded text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />Create Assembly Order
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
