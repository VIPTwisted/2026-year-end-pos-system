import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, Users } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  acknowledged: 'default',
  partial: 'warning',
  received: 'success',
  cancelled: 'destructive',
}

export default async function PurchasingPage() {
  const [pos, suppliers] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: { supplier: true, store: true, items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.supplier.findMany({
      include: {
        purchaseOrders: {
          include: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  const openStatuses = new Set(['draft', 'sent', 'acknowledged', 'partial'])
  const totalValue = pos.reduce((sum, po) => sum + (po.totalAmount ?? 0), 0)
  const openCount = pos.filter(po => openStatuses.has(po.status)).length
  const receivedCount = pos.filter(po => po.status === 'received').length

  // Supplier scorecard computations
  type SupplierScore = {
    id: string
    name: string
    paymentTerms: string | null
    isActive: boolean
    totalPOs: number
    totalValue: number
    onTimeRate: number
    activePOs: number
  }

  const supplierScores: SupplierScore[] = suppliers.map(s => {
    const totalPOs = s.purchaseOrders.length
    const totalVal = s.purchaseOrders.reduce((sum, po) => sum + (po.totalAmount ?? 0), 0)
    const receivedPOs = s.purchaseOrders.filter(po => po.status === 'received').length
    const activePOs = s.purchaseOrders.filter(
      po => po.status !== 'received' && po.status !== 'cancelled'
    ).length
    const onTimeRate = totalPOs > 0 ? (receivedPOs / totalPOs) * 100 : 0

    return {
      id: s.id,
      name: s.name,
      paymentTerms: s.paymentTerms ?? null,
      isActive: activePOs > 0 || totalPOs === 0,
      totalPOs,
      totalValue: totalVal,
      onTimeRate,
      activePOs,
    }
  })

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

        {/* Supplier Scorecard — D365 Supplier Performance */}
        {supplierScores.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">Supplier Scorecard</h2>
              <p className="text-sm text-zinc-500">D365 Supply Chain · supplier performance analytics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {supplierScores.map(s => {
                const onTimeColor =
                  s.onTimeRate > 80
                    ? 'text-emerald-400'
                    : s.onTimeRate >= 50
                    ? 'text-amber-400'
                    : s.totalPOs === 0
                    ? 'text-zinc-500'
                    : 'text-red-400'

                return (
                  <Card key={s.id} className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-bold text-zinc-100 leading-tight">
                          {s.name}
                        </CardTitle>
                        <div className="flex gap-1.5 shrink-0">
                          {s.isActive ? (
                            <Badge variant="success" className="text-xs">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                          {s.paymentTerms && (
                            <Badge variant="outline" className="text-xs">{s.paymentTerms}</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-zinc-100">{s.totalPOs}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Total POs</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-zinc-100 text-[13px] leading-6">
                            {s.totalPOs > 0 ? formatCurrency(s.totalValue) : '—'}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">Total Value</p>
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${onTimeColor}`}>
                            {s.totalPOs > 0 ? s.onTimeRate.toFixed(0) + '%' : '—'}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">On-Time %</p>
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${s.activePOs > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                            {s.activePOs}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">Active POs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

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
                  <th className="text-center pb-3 font-medium">Items</th>
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
                    <td className="py-3 pr-4 text-center">
                      <Badge variant="outline" className="text-xs font-mono">
                        {po.items.length}
                      </Badge>
                    </td>
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
