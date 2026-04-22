export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Package, Layers, CheckCircle2, Play, RefreshCw } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/30',
    Released: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Finished: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
      {status}
    </span>
  )
}

export default async function AssemblyOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.assemblyOrder.findUnique({
    where: { id },
    include: {
      bom: { select: { id: true, bomNo: true, versionCode: true } },
      lines: { orderBy: { lineNo: 'asc' } },
    },
  })
  if (!order) notFound()

  const pctDone = order.qtyToAssemble > 0
    ? Math.min(Math.round((order.qtyAssembled / order.qtyToAssemble) * 100), 100)
    : 0

  return (
    <>
      <TopBar title={order.orderNo} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-6xl mx-auto p-6 space-y-6">

          <div className="flex items-center gap-3">
            <Link href="/assembly/orders" className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Assembly Management &rsaquo; Orders</p>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-100 font-mono">{order.orderNo}</h2>
                <StatusBadge status={order.status} />
              </div>
            </div>
            {/* Action ribbon */}
            <div className="flex items-center gap-2">
              {order.status === 'Open' && (
                <form action={`/api/assembly/orders/${order.id}`} method="PATCH">
                  <button
                    formAction={`/api/assembly/orders/${order.id}`}
                    className="h-8 px-3 rounded text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    title="Release order"
                  >
                    <Play className="w-3.5 h-3.5" />Release
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main — FastTabs */}
            <div className="col-span-2 space-y-4">

              {/* General FastTab */}
              <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <summary className="px-5 py-3.5 border-b border-zinc-800/50 cursor-pointer text-[12px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors select-none">
                  General
                </summary>
                <div className="p-5 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Order No.', value: order.orderNo },
                    { label: 'Item No.', value: order.itemNo ?? '—' },
                    { label: 'Description', value: order.description ?? '—' },
                    { label: 'Qty to Assemble', value: String(order.qtyToAssemble) },
                    { label: 'Qty Assembled', value: String(order.qtyAssembled) },
                    { label: 'Unit of Measure', value: order.unitOfMeasure },
                    { label: 'Due Date', value: order.dueDate ? new Date(order.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                    { label: 'Location Code', value: order.locationCode ?? '—' },
                    { label: 'BOM Version', value: order.bomVersionCode },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">{label}</div>
                      <div className="text-sm text-zinc-200">{value}</div>
                    </div>
                  ))}
                  {order.notes && (
                    <div className="col-span-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Notes</div>
                      <div className="text-xs text-zinc-400 bg-zinc-900/60 rounded px-3 py-2">{order.notes}</div>
                    </div>
                  )}
                </div>
              </details>

              {/* Lines FastTab */}
              <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <summary className="px-5 py-3.5 border-b border-zinc-800/50 cursor-pointer text-[12px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors select-none">
                  Component Lines ({order.lines.length})
                </summary>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-zinc-800/60">
                      <tr>
                        {['Line', 'Type', 'Component No.', 'Description', 'Qty', 'Consumed', 'UoM', 'Unit Cost'].map(h => (
                          <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${['Qty', 'Consumed', 'Unit Cost'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {order.lines.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-zinc-600 text-sm">No component lines</td>
                        </tr>
                      ) : order.lines.map(l => (
                        <tr key={l.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-600">{l.lineNo}</td>
                          <td className="px-4 py-3 text-[12px] text-zinc-400">{l.type}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-blue-400">{l.componentNo ?? '—'}</td>
                          <td className="px-4 py-3 text-sm text-zinc-200">{l.description ?? '—'}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-zinc-200">{l.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-emerald-400">{l.qtyConsumed}</td>
                          <td className="px-4 py-3 text-[12px] text-zinc-400">{l.unitOfMeasure}</td>
                          <td className="px-4 py-3 text-right font-mono text-[12px] tabular-nums text-zinc-400">${l.unitCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>

              {/* Statistics FastTab */}
              <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <summary className="px-5 py-3.5 border-b border-zinc-800/50 cursor-pointer text-[12px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors select-none">
                  Statistics
                </summary>
                <div className="p-5 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Qty', value: String(order.qtyToAssemble) },
                    { label: 'Assembled', value: String(order.qtyAssembled) },
                    { label: 'Component Lines', value: String(order.lines.length) },
                    { label: 'Total Unit Cost', value: `$${order.lines.reduce((s, l) => s + l.unitCost * l.quantity, 0).toFixed(2)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded">
                      <span className="text-xs text-zinc-500">{label}</span>
                      <span className="text-sm font-semibold text-zinc-200 font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>

            {/* FactBox sidebar */}
            <div className="space-y-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Assembly Progress</div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">Completion</span>
                    <span className="text-xs font-bold text-zinc-200">{pctDone}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pctDone >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${pctDone}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'To Assemble', value: order.qtyToAssemble },
                    { label: 'Assembled', value: order.qtyAssembled },
                    { label: 'Remaining', value: Math.max(0, order.qtyToAssemble - order.qtyAssembled) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{label}</span>
                      <span className="text-xs font-semibold text-zinc-200 tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.bom && (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Assembly BOM</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">BOM No.</span>
                      <Link href={`/assembly/bom/${order.bom.id}`} className="text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors">
                        {order.bom.bomNo}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Version</span>
                      <span className="text-xs text-zinc-300">{order.bom.versionCode}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Actions</div>
                <div className="space-y-2">
                  {order.status === 'Open' && (
                    <div className="w-full h-8 rounded text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Play className="w-3.5 h-3.5" />Release
                    </div>
                  )}
                  {order.status === 'Released' && (
                    <div className="w-full h-8 rounded text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <CheckCircle2 className="w-3.5 h-3.5" />Post
                    </div>
                  )}
                  <div className="w-full h-8 rounded text-[12px] font-medium text-zinc-300 border border-zinc-700/60 hover:bg-zinc-800/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                    <Layers className="w-3.5 h-3.5" />Explode BOM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
