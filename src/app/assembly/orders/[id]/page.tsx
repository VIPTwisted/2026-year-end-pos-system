export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Layers, Package } from 'lucide-react'
import { AssemblyActions } from './AssemblyActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  open: 'secondary',
  released: 'default',
  finished: 'success',
}

export default async function AssemblyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.assemblyOrder.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      store: { select: { id: true, name: true } },
      bom: { select: { type: true, description: true } },
      lines: {
        include: { component: { select: { id: true, name: true, sku: true } } },
      },
    },
  })
  if (!order) notFound()

  const allPicked = order.lines.every(l => l.quantityPicked >= l.quantity)

  return (
    <>
      <TopBar title={order.orderNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <Link
          href="/assembly"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Assembly Orders
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="capitalize">
                    {order.status}
                  </Badge>
                  {order.bom && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {order.bom.type.replace('_', '-')}
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{order.orderNumber}</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {order.product.name} <span className="font-mono text-zinc-600">({order.product.sku})</span>
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
                  <span>Qty: <span className="text-zinc-300">{order.quantity}</span></span>
                  <span>To Assemble: <span className="text-zinc-300">{order.quantityToAssemble}</span></span>
                  <span>Store: <span className="text-zinc-300">{order.store.name}</span></span>
                  {order.dueDate && <span>Due: <span className="text-zinc-300">{formatDate(order.dueDate)}</span></span>}
                </div>
                {order.notes && (
                  <p className="mt-2 text-xs text-zinc-500 bg-zinc-900 rounded px-3 py-2">{order.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Lines */}
        {order.lines.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400" />
                Component Lines
                <span className="ml-auto text-xs font-normal text-zinc-500">{order.lines.length} components</span>
                {allPicked && order.status !== 'finished' && (
                  <Badge variant="success" className="text-xs ml-2">All Picked</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Component', 'SKU', 'Required', 'Picked', 'UOM', 'Progress'].map(h => (
                      <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map(l => {
                    const pct = l.quantity > 0 ? Math.min((l.quantityPicked / l.quantity) * 100, 100) : 0
                    return (
                      <tr key={l.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                        <td className="px-4 py-3 text-zinc-200">{l.component.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">{l.component.sku}</td>
                        <td className="px-4 py-3 text-zinc-300">{l.quantity}</td>
                        <td className="px-4 py-3 text-emerald-400">{l.quantityPicked}</td>
                        <td className="px-4 py-3 text-xs text-zinc-600">{l.unitOfMeasure}</td>
                        <td className="px-4 py-3 w-32">
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-600 mt-0.5 block">{pct.toFixed(0)}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <AssemblyActions order={order} />
      </main>
    </>
  )
}
