import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  acknowledged: 'default',
  partial: 'warning',
  received: 'success',
  cancelled: 'destructive',
}

export default async function PurchasingPage() {
  const pos = await prisma.purchaseOrder.findMany({
    include: { supplier: true, store: true, items: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const openStatuses = new Set(['draft', 'sent', 'acknowledged', 'partial'])
  const totalValue = pos.reduce((sum, po) => sum + (po.totalAmount ?? 0), 0)
  const openCount = pos.filter(po => openStatuses.has(po.status)).length
  const receivedCount = pos.filter(po => po.status === 'received').length

  return (
    <>
      <TopBar title="Purchasing & Procurement" />
      <main className="flex-1 p-6 overflow-auto">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total POs</p>
              <p className="text-2xl font-bold text-zinc-100">{pos.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open</p>
              <p className="text-2xl font-bold text-amber-400">{openCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Received</p>
              <p className="text-2xl font-bold text-emerald-400">{receivedCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Value</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalValue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* PO Table */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Purchase Orders</h2>
          <p className="text-sm text-zinc-500">{pos.length} purchase orders</p>
        </div>

        {pos.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Truck className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No Purchase Orders</p>
              <p className="text-sm">Create your first PO to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">PO #</th>
                  <th className="text-left pb-3 font-medium">Created</th>
                  <th className="text-left pb-3 font-medium">Supplier</th>
                  <th className="text-left pb-3 font-medium">Store</th>
                  <th className="text-right pb-3 font-medium">Items</th>
                  <th className="text-left pb-3 font-medium">Expected</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pos.map(po => (
                  <tr key={po.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{po.poNumber}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">{formatDate(po.createdAt)}</td>
                    <td className="py-3 pr-4 text-zinc-300">{po.supplier?.name ?? '—'}</td>
                    <td className="py-3 pr-4 text-zinc-400">{po.store?.name ?? '—'}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{po.items.length}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                      {po.expectedDate ? formatDate(po.expectedDate) : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-400">
                      {formatCurrency(po.totalAmount ?? 0)}
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={STATUS_VARIANT[po.status] ?? 'secondary'} className="capitalize">
                        {po.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
