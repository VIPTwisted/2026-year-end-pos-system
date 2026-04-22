export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { SubcontractingActions } from './SubcontractingActions'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  open: 'default',
  sent: 'warning',
  received: 'success',
  closed: 'secondary',
}

export default async function SubcontractingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.subcontractingOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { type: 'asc' },
      },
    },
  })
  if (!order) notFound()

  const components = order.lines.filter(l => l.type === 'component')
  const outputs = order.lines.filter(l => l.type === 'output')

  return (
    <>
      <TopBar title={`Subcontracting — ${order.orderNumber}`} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/manufacturing/subcontracting"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Subcontracting
          </Link>

          <div className="grid grid-cols-3 gap-6">
            {/* Header Card */}
            <div className="col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                      {order.orderNumber}
                    </CardTitle>
                    <Badge variant={STATUS_BADGE[order.status] ?? 'secondary'} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Vendor</div>
                      <div className="text-zinc-200">{order.vendor.name}</div>
                      <div className="text-xs text-zinc-500">{order.vendor.vendorCode}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Production Order</div>
                      <div className="text-zinc-400 font-mono text-xs">{order.productionOrderId ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Work Center</div>
                      <div className="text-zinc-400">{order.workCenterId ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Operation No.</div>
                      <div className="text-zinc-400">{order.operationNo ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Description</div>
                      <div className="text-zinc-200">{order.description}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Quantity</div>
                      <div className="text-zinc-200">{order.quantity} {order.unitOfMeasure}</div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="pt-2 border-t border-zinc-800">
                      <div className="text-xs text-zinc-500 mb-1">Notes</div>
                      <div className="text-sm text-zinc-400">{order.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Unit Cost</div>
                    <div className="text-lg font-bold text-zinc-100">{formatCurrency(order.unitCost)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Total Cost</div>
                    <div className="text-xl font-bold text-blue-400">{formatCurrency(order.totalCost)}</div>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Expected</span>
                      <span className="text-zinc-300">{order.expectedDate ? formatDate(order.expectedDate) : '—'}</span>
                    </div>
                    {order.sentDate && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Sent</span>
                        <span className="text-zinc-300">{formatDate(order.sentDate)}</span>
                      </div>
                    )}
                    {order.receivedDate && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Received</span>
                        <span className="text-emerald-400">{formatDate(order.receivedDate)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <SubcontractingActions orderId={order.id} status={order.status} />
            </div>
          </div>

          {/* Components */}
          {components.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-400">Components Sent to Vendor</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Product</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">SKU</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Qty</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">UOM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map(l => (
                      <tr key={l.id} className="border-b border-zinc-800/50">
                        <td className="px-4 py-2.5 text-zinc-200">{l.product.name}</td>
                        <td className="px-4 py-2.5 text-zinc-500 font-mono text-xs">{l.product.sku}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-300">{l.quantity}</td>
                        <td className="px-4 py-2.5 text-zinc-400">{l.unitOfMeasure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Outputs */}
          {outputs.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-400">Expected Outputs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Product</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">SKU</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Qty</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">UOM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outputs.map(l => (
                      <tr key={l.id} className="border-b border-zinc-800/50">
                        <td className="px-4 py-2.5 text-zinc-200">{l.product.name}</td>
                        <td className="px-4 py-2.5 text-zinc-500 font-mono text-xs">{l.product.sku}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-300">{l.quantity}</td>
                        <td className="px-4 py-2.5 text-zinc-400">{l.unitOfMeasure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
