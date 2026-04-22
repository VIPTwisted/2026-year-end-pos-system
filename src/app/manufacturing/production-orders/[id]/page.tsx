import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductionOrderActions } from './ProductionOrderActions'
import {
  ArrowLeft, Package, Layers, GitBranch, Settings2, Clock,
} from 'lucide-react'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  simulated: 'secondary',
  planned: 'default',
  firm_planned: 'warning',
  released: 'warning',
  finished: 'success',
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

  const pctDone = order.quantity > 0 ? Math.min(100, (order.quantityFinished / order.quantity) * 100) : 0

  return (
    <>
      <TopBar title={order.orderNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/manufacturing/production-orders"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Production Orders
        </Link>

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={STATUS_BADGE[order.status] ?? 'secondary'} className="capitalize">
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h1 className="text-xl font-bold text-zinc-100 font-mono">{order.orderNumber}</h1>
                  <p className="text-sm text-zinc-400 mt-0.5">{order.product.name}</p>
                  <p className="text-xs text-zinc-600">{order.product.sku} · {order.store?.name ?? '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-zinc-100">
                  {order.quantity} <span className="text-base text-zinc-500">{order.unitOfMeasure}</span>
                </p>
                <p className="text-xs text-zinc-500">
                  {order.quantityFinished > 0 && (
                    <span className="text-emerald-400 font-semibold">{order.quantityFinished} finished</span>
                  )}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {order.quantityFinished > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Output Progress</span>
                  <span>{pctDone.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${pctDone}%` }}
                  />
                </div>
              </div>
            )}

            {/* Meta grid */}
            <div className="mt-5 pt-5 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Due Date', value: order.dueDate ? formatDate(order.dueDate) : '—', icon: Clock },
                { label: 'Starting Date', value: order.startingDate ? formatDate(order.startingDate) : '—', icon: Clock },
                {
                  label: 'BOM',
                  value: order.bom ? `${order.bom.bomNumber}` : '—',
                  icon: Layers,
                  href: order.bom ? `/manufacturing/boms/${order.bom.id}` : undefined,
                },
                {
                  label: 'Routing',
                  value: order.routing ? `${order.routing.routingNumber}` : '—',
                  icon: GitBranch,
                  href: order.routing ? `/manufacturing/routings/${order.routing.id}` : undefined,
                },
              ].map(({ label, value, icon: Icon, href }) => (
                <div key={label}>
                  <div className="flex items-center gap-1 text-zinc-500 mb-0.5">
                    <Icon className="w-3 h-3" />
                    <span className="uppercase tracking-wide">{label}</span>
                  </div>
                  {href ? (
                    <Link href={href} className="text-blue-400 hover:underline font-medium">{value}</Link>
                  ) : (
                    <p className="text-zinc-300 font-medium">{value}</p>
                  )}
                </div>
              ))}
            </div>

            {order.notes && (
              <p className="mt-4 text-xs text-zinc-500 bg-zinc-900 rounded p-3 border border-zinc-800">
                {order.notes}
              </p>
            )}

            {/* Actions */}
            {order.status !== 'finished' && (
              <div className="mt-5 pt-5 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Actions</p>
                <ProductionOrderActions
                  orderId={order.id}
                  status={order.status}
                  quantity={order.quantity}
                  quantityFinished={order.quantityFinished}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component Lines */}
        {order.lines.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400" />
                Component Lines ({order.lines.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['#', 'Component', 'SKU', 'Qty Required', 'Qty Picked', 'Qty Consumed', 'UOM'].map(h => (
                      <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-zinc-600">{line.lineNo}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs text-zinc-300">{line.product.name}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500 font-mono">{line.product.sku}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-300 font-semibold">{line.quantity}</td>
                      <td className="px-4 py-2.5 text-xs text-blue-400">{line.quantityPicked}</td>
                      <td className="px-4 py-2.5 text-xs text-emerald-400">{line.quantityConsumed}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">{line.unitOfMeasure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Capacity Needs */}
        {order.capacityNeeds.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-zinc-400" />
                Capacity Needs ({order.capacityNeeds.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Operation', 'Description', 'Work Center', 'Allocated (hrs)', 'Remaining (hrs)', 'Start', 'End', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.capacityNeeds.map(cn => (
                    <tr key={cn.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-mono text-zinc-400">{cn.operationNo}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-300">{cn.description}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{cn.workCenterId}</td>
                      <td className="px-4 py-2.5 text-xs text-blue-400 font-semibold">{cn.allocatedTime}</td>
                      <td className="px-4 py-2.5 text-xs text-amber-400 font-semibold">{cn.remainingTime}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">
                        {cn.startingDateTime ? formatDate(cn.startingDateTime) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">
                        {cn.endingDateTime ? formatDate(cn.endingDateTime) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={cn.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                          {cn.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

      </main>
    </>
  )
}
