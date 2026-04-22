export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import {
  ArrowLeft, Package, Layers, GitBranch, Clock, MapPin,
  ChevronRight, DollarSign, BarChart2,
} from 'lucide-react'

const STATUS_CHIP: Record<string, string> = {
  simulated: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  planned: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  firm_planned: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  released: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  finished: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

const STATUS_NEXT: Record<string, string> = {
  simulated: 'planned',
  planned: 'firm_planned',
  firm_planned: 'released',
  released: 'finished',
}
const STATUS_NEXT_LABEL: Record<string, string> = {
  simulated: 'Planned',
  planned: 'Firm Planned',
  firm_planned: 'Released',
  released: 'Finished',
}

export default async function ProductionOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.productionOrder.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true, unit: true } },
      store: { select: { id: true, name: true } },
      bom: { select: { id: true, bomNumber: true, description: true } },
      routing: { select: { id: true, routingNumber: true, description: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
        orderBy: { lineNo: 'asc' },
      },
      capacityNeeds: { orderBy: { operationNo: 'asc' } },
    },
  })

  if (!order) notFound()

  const pctDone = order.quantity > 0
    ? Math.min(100, (order.quantityFinished / order.quantity) * 100)
    : 0

  const chipCls = STATUS_CHIP[order.status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  const nextStatus = STATUS_NEXT[order.status]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={order.orderNumber} />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800/60 bg-[#12121f] px-4 py-2 flex items-center gap-1 flex-wrap">
          <Link href="/manufacturing/production-orders">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>
          </Link>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          {nextStatus && (
            <form action={`/api/manufacturing/production-orders/${id}`} method="PATCH">
              <Link
                href={`/manufacturing/production-orders/${id}?action=advance`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors"
              >
                Change Status → {STATUS_NEXT_LABEL[order.status]}
                <ChevronRight className="w-3 h-3" />
              </Link>
            </form>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Header Card */}
          <div className={sectionCls}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${chipCls}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h1 className="text-lg font-bold text-zinc-100 font-mono">{order.orderNumber}</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">{order.product.name}</p>
                    <p className="text-[11px] text-zinc-600">{order.product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                    {order.quantity}
                    <span className="text-sm text-zinc-500 ml-1">{order.unitOfMeasure}</span>
                  </p>
                  {order.quantityFinished > 0 && (
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                      {order.quantityFinished} finished
                    </p>
                  )}
                </div>
              </div>

              {order.quantityFinished > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
                    <span>Output Progress</span>
                    <span>{pctDone.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${pctDone}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main FastTabs */}
            <div className="lg:col-span-2 space-y-4">

              {/* General FastTab */}
              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  <Package className="w-3.5 h-3.5 text-zinc-500" />
                  General
                </div>
                <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  {[
                    { label: 'Order No.', value: order.orderNumber, mono: true },
                    { label: 'Status', value: order.status.replace(/_/g, ' '), capitalize: true },
                    { label: 'Source Type', value: order.sourceType.replace(/_/g, ' '), capitalize: true },
                    { label: 'Item No.', value: order.product.sku, mono: true },
                    { label: 'Description', value: order.product.name },
                    { label: 'Quantity', value: `${order.quantity} ${order.unitOfMeasure}` },
                    { label: 'Qty Finished', value: order.quantityFinished > 0 ? String(order.quantityFinished) : '—' },
                    { label: 'Location', value: order.store?.name ?? '—' },
                  ].map(({ label, value, mono, capitalize }) => (
                    <div key={label}>
                      <p className="text-zinc-600 uppercase tracking-wide text-[10px] mb-0.5">{label}</p>
                      <p className={`text-zinc-300 font-medium ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule FastTab */}
              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Schedule
                </div>
                <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  {[
                    { label: 'Due Date', value: order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '—' },
                    { label: 'Starting Date', value: order.startingDate ? new Date(order.startingDate).toLocaleDateString() : '—' },
                    { label: 'Ending Date', value: order.endingDate ? new Date(order.endingDate).toLocaleDateString() : '—' },
                    { label: 'Planned Start', value: order.plannedStart ? new Date(order.plannedStart).toLocaleDateString() : '—' },
                    { label: 'Planned End', value: order.plannedEnd ? new Date(order.plannedEnd).toLocaleDateString() : '—' },
                    { label: 'Actual Start', value: order.actualStart ? new Date(order.actualStart).toLocaleDateString() : '—' },
                    { label: 'Actual End', value: order.actualEnd ? new Date(order.actualEnd).toLocaleDateString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-zinc-600 uppercase tracking-wide text-[10px] mb-0.5">{label}</p>
                      <p className="text-zinc-300 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lines FastTab */}
              {order.lines.length > 0 && (
                <div className={sectionCls}>
                  <div className={tabHeaderCls}>
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    Lines ({order.lines.length})
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800/50">
                        {['#', 'Component', 'SKU', 'Qty Required', 'Qty Picked', 'Qty Consumed', 'UOM'].map(h => (
                          <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-600 font-medium tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {order.lines.map(line => (
                        <tr key={line.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-2.5 text-zinc-600">{line.lineNo}</td>
                          <td className="px-4 py-2.5 text-zinc-300">{line.product.name}</td>
                          <td className="px-4 py-2.5 font-mono text-zinc-500">{line.product.sku}</td>
                          <td className="px-4 py-2.5 text-zinc-100 font-semibold tabular-nums">{line.quantity}</td>
                          <td className="px-4 py-2.5 text-blue-400 tabular-nums">{line.quantityPicked > 0 ? line.quantityPicked : '—'}</td>
                          <td className="px-4 py-2.5 text-emerald-400 tabular-nums">{line.quantityConsumed > 0 ? line.quantityConsumed : '—'}</td>
                          <td className="px-4 py-2.5 text-zinc-500">{line.unitOfMeasure}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* BOM / Routing links */}
              <div className="grid grid-cols-2 gap-4">
                <div className={sectionCls}>
                  <div className={tabHeaderCls}>
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    Bill of Material
                  </div>
                  <div className="p-4 text-xs">
                    {order.bom ? (
                      <Link href={`/manufacturing/boms/${order.bom.id}`} className="text-blue-400 hover:underline font-mono">
                        {order.bom.bomNumber}
                      </Link>
                    ) : (
                      <span className="text-zinc-600">Not assigned</span>
                    )}
                    {order.bom?.description && (
                      <p className="text-zinc-500 mt-1">{order.bom.description}</p>
                    )}
                  </div>
                </div>
                <div className={sectionCls}>
                  <div className={tabHeaderCls}>
                    <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                    Routing
                  </div>
                  <div className="p-4 text-xs">
                    {order.routing ? (
                      <Link href={`/manufacturing/routings/${order.routing.id}`} className="text-blue-400 hover:underline font-mono">
                        {order.routing.routingNumber}
                      </Link>
                    ) : (
                      <span className="text-zinc-600">Not assigned</span>
                    )}
                    {order.routing?.description && (
                      <p className="text-zinc-500 mt-1">{order.routing.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FactBox — Statistics */}
            <div className="space-y-4">
              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  <BarChart2 className="w-3.5 h-3.5 text-zinc-500" />
                  Statistics
                </div>
                <div className="p-4 space-y-3 text-xs">
                  {[
                    { label: 'Ordered Qty', value: `${order.quantity} ${order.unitOfMeasure}`, color: 'text-zinc-300' },
                    { label: 'Finished Qty', value: order.quantityFinished > 0 ? `${order.quantityFinished} ${order.unitOfMeasure}` : '—', color: 'text-emerald-400' },
                    { label: 'Remaining Qty', value: `${Math.max(0, order.quantity - order.quantityFinished)} ${order.unitOfMeasure}`, color: 'text-amber-400' },
                    { label: 'Component Lines', value: String(order.lines.length), color: 'text-zinc-300' },
                    { label: 'Capacity Needs', value: String(order.capacityNeeds.length), color: 'text-zinc-300' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-zinc-500">{label}</span>
                      <span className={`font-semibold tabular-nums ${color}`}>{value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Progress</span>
                      <span className={`font-semibold tabular-nums ${pctDone >= 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {pctDone.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  Location
                </div>
                <div className="p-4 text-xs">
                  <p className="text-zinc-300">{order.store?.name ?? '—'}</p>
                </div>
              </div>

              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                  Cost
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Cost Amount (Expected)</span>
                    <span className="text-zinc-300 tabular-nums">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Cost Amount (Actual)</span>
                    <span className="text-zinc-300 tabular-nums">—</span>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className={sectionCls}>
                  <div className={tabHeaderCls}>Notes</div>
                  <p className="p-4 text-xs text-zinc-400">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
