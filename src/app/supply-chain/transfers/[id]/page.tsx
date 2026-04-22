import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, ArrowLeftRight, Package } from 'lucide-react'
import { TransferActions } from './TransferActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  open: 'secondary',
  released: 'default',
  shipped: 'warning',
  received: 'success',
  closed: 'secondary',
}

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const transfer = await prisma.transferOrder.findUnique({
    where: { id },
    include: {
      fromStore: { select: { id: true, name: true } },
      toStore: { select: { id: true, name: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
    },
  })
  if (!transfer) notFound()

  return (
    <>
      <TopBar title={transfer.orderNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <Link
          href="/supply-chain/transfers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Transfers
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={STATUS_VARIANT[transfer.status] ?? 'secondary'} className="capitalize">
                    {transfer.status}
                  </Badge>
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{transfer.orderNumber}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                  <span className="font-medium text-zinc-200">{transfer.fromStore.name}</span>
                  <ArrowRight className="w-4 h-4 text-zinc-600" />
                  <span className="font-medium text-zinc-200">{transfer.toStore.name}</span>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                  {transfer.shipmentDate && <span>Ship: {formatDate(transfer.shipmentDate)}</span>}
                  {transfer.receiptDate && <span>Receipt: {formatDate(transfer.receiptDate)}</span>}
                  <span>Created: {formatDate(transfer.createdAt)}</span>
                </div>
                {transfer.notes && (
                  <p className="mt-2 text-xs text-zinc-500 bg-zinc-900 rounded px-3 py-2">{transfer.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-400" />
              Transfer Lines
              <span className="ml-auto text-xs font-normal text-zinc-500">{transfer.lines.length} items</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Product', 'SKU', 'Qty', 'Shipped', 'Received', 'UOM'].map(h => (
                    <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transfer.lines.map(l => (
                  <tr key={l.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                    <td className="px-4 py-3 text-zinc-200">{l.product.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{l.product.sku}</td>
                    <td className="px-4 py-3 text-zinc-300">{l.quantity}</td>
                    <td className="px-4 py-3 text-amber-400">{l.quantityShipped}</td>
                    <td className="px-4 py-3 text-emerald-400">{l.quantityReceived}</td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{l.unitOfMeasure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Actions */}
        <TransferActions transfer={transfer} />
      </main>
    </>
  )
}

