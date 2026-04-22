export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, DollarSign, Package } from 'lucide-react'
import { LandedCostActions } from './LandedCostActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'secondary'> = {
  open: 'default',
  posted: 'success',
}

const TYPE_LABELS: Record<string, string> = {
  freight: 'Freight', customs: 'Customs', insurance: 'Insurance', other: 'Other',
}
const ALLOC_LABELS: Record<string, string> = {
  by_value: 'By Value', by_quantity: 'By Quantity', by_weight: 'By Weight',
}

export default async function LandedCostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cost = await prisma.landedCost.findUnique({
    where: { id },
    include: {
      purchaseOrder: { select: { id: true, poNumber: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  })
  if (!cost) notFound()

  return (
    <>
      <TopBar title={cost.costNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <Link
          href="/supply-chain/landed-costs"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Landed Costs
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={STATUS_VARIANT[cost.status] ?? 'secondary'} className="capitalize">
                    {cost.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{TYPE_LABELS[cost.costType] ?? cost.costType}</Badge>
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{cost.costNumber}</h1>
                <p className="text-sm text-zinc-400 mt-1">{cost.description}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
                  {cost.vendor && <span>Vendor: <span className="text-zinc-300">{cost.vendor}</span></span>}
                  <span>Amount: <span className="text-emerald-400 font-semibold">{formatCurrency(Number(cost.amount))} {cost.currency !== 'USD' ? cost.currency : ''}</span></span>
                  <span>Allocation: <span className="text-zinc-300">{ALLOC_LABELS[cost.allocationMethod] ?? cost.allocationMethod}</span></span>
                  {cost.purchaseOrder && (
                    <span>PO: <Link href={`/purchasing/${cost.purchaseOrder.id}`} className="text-blue-400 hover:underline">{cost.purchaseOrder.poNumber}</Link></span>
                  )}
                  <span>Created: <span className="text-zinc-300">{formatDate(cost.createdAt)}</span></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lines */}
        {cost.lines.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400" />
                Allocated Lines
                <span className="ml-auto text-xs font-normal text-zinc-500">{cost.lines.length} lines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Product', 'SKU', 'Quantity', 'Allocated Amount'].map(h => (
                      <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cost.lines.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 text-zinc-200">{l.product.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{l.product.sku}</td>
                      <td className="px-4 py-3 text-zinc-400">{l.quantity}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">{formatCurrency(Number(l.allocatedAmount))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={3} className="px-4 py-2 text-xs text-zinc-500 uppercase tracking-wide">Total</td>
                    <td className="px-4 py-2 text-emerald-400 font-bold">
                      {formatCurrency(cost.lines.reduce((s, l) => s + Number(l.allocatedAmount), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <LandedCostActions cost={{ id: cost.id, status: cost.status }} />
      </main>
    </>
  )
}
