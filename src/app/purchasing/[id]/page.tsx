export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { POActions } from './POActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  acknowledged: 'default',
  partial: 'warning',
  received: 'success',
  cancelled: 'destructive',
}

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      store: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          receiptLines: true,
        },
      },
      receipts: {
        include: { lines: true },
        orderBy: { receivedAt: 'desc' },
      },
    },
  })

  if (!po) notFound()

  const canReceive = !['received', 'cancelled'].includes(po.status)
  const canCancel = ['draft', 'sent'].includes(po.status)

  return (
    <>
      <TopBar title={`PO ${po.poNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Back */}
        <div>
          <Link href="/purchasing">
            <Button variant="outline" size="sm">← Back to Purchasing</Button>
          </Link>
        </div>

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

              {/* PO Identity */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-mono text-zinc-100">{po.poNumber}</span>
                  <Badge variant={STATUS_VARIANT[po.status] ?? 'secondary'} className="capitalize">
                    {po.status}
                  </Badge>
                </div>
                <div className="text-sm text-zinc-300">
                  <span className="font-semibold">{po.supplier.name}</span>
                  {po.supplier.contactName && (
                    <span className="text-zinc-500 ml-2">· {po.supplier.contactName}</span>
                  )}
                  {po.supplier.email && (
                    <span className="text-zinc-500 ml-2">· {po.supplier.email}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span>Store: <span className="text-zinc-300">{po.store.name}</span></span>
                  <span>Created: <span className="text-zinc-300">{formatDate(po.createdAt)}</span></span>
                  {po.expectedDate && (
                    <span>Expected: <span className="text-zinc-300">{formatDate(po.expectedDate)}</span></span>
                  )}
                  {po.receivedDate && (
                    <span>Received: <span className="text-emerald-400">{formatDate(po.receivedDate)}</span></span>
                  )}
                </div>
                {po.notes && (
                  <p className="text-xs text-zinc-500 italic">{po.notes}</p>
                )}
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Subtotal</p>
                  <p className="text-lg font-semibold text-zinc-200">{formatCurrency(po.subtotal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Shipping</p>
                  <p className="text-lg font-semibold text-zinc-200">{formatCurrency(po.shippingCost)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Tax</p>
                  <p className="text-lg font-semibold text-zinc-200">{formatCurrency(po.taxAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(po.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-3 flex-wrap">
              {canReceive && (
                <Link href={`/purchasing/${po.id}/receive`}>
                  <Button>Receive Items</Button>
                </Link>
              )}
              {canCancel && (
                <POActions poId={po.id} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Product</th>
                  <th className="text-left pb-3 font-medium">SKU</th>
                  <th className="text-right pb-3 font-medium">Ordered</th>
                  <th className="text-right pb-3 font-medium">Received</th>
                  <th className="text-right pb-3 font-medium">Outstanding</th>
                  <th className="text-right pb-3 font-medium">Unit Cost</th>
                  <th className="text-right pb-3 font-medium">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {po.items.map(item => {
                  const outstanding = Math.max(0, item.orderedQty - item.receivedQty)
                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 text-zinc-100">{item.productName}</td>
                      <td className="py-3 pr-4 text-zinc-400 font-mono text-xs">{item.sku}</td>
                      <td className="py-3 pr-4 text-right text-zinc-300">{item.orderedQty}</td>
                      <td className="py-3 pr-4 text-right text-emerald-400">{item.receivedQty}</td>
                      <td className="py-3 pr-4 text-right">
                        <span className={outstanding > 0 ? 'text-amber-400' : 'text-zinc-500'}>
                          {outstanding}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400">{formatCurrency(item.unitCost)}</td>
                      <td className="py-3 text-right text-emerald-400 font-semibold">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td colSpan={5} />
                  <td className="py-3 pr-4 text-right text-xs text-zinc-500 uppercase tracking-wide">Total</td>
                  <td className="py-3 text-right text-zinc-100 font-bold">{formatCurrency(po.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Receipts */}
        {po.receipts.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Receipts ({po.receipts.length})
            </h3>
            <div className="space-y-4">
              {po.receipts.map(receipt => (
                <Card key={receipt.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-zinc-100">
                          {receipt.receiptNumber}
                        </span>
                        <span className="text-xs text-zinc-500">{formatDate(receipt.receivedAt)}</span>
                        {receipt.receivedBy && (
                          <span className="text-xs text-zinc-500">· by {receipt.receivedBy}</span>
                        )}
                      </div>
                    </div>
                    {receipt.notes && (
                      <p className="text-xs text-zinc-500 italic mb-3">{receipt.notes}</p>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                            <th className="text-left pb-2 font-medium">PO Item ID</th>
                            <th className="text-right pb-2 font-medium">Qty Received</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {receipt.lines.map(rl => {
                            const item = po.items.find(i => i.id === rl.poItemId)
                            return (
                              <tr key={rl.id}>
                                <td className="py-1.5 text-zinc-300">
                                  {item ? item.productName : rl.poItemId}
                                </td>
                                <td className="py-1.5 text-right text-emerald-400 font-semibold">
                                  {rl.quantityReceived}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

      </main>
    </>
  )
}
