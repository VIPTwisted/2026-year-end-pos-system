import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, ShoppingBag, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_FLOW = [
  'created', 'confirmed', 'picking', 'packed', 'shipped', 'delivered',
  'cancelled', 'return_in_progress',
]

const STATUS_BADGE: Record<string, 'secondary' | 'warning' | 'default' | 'success' | 'destructive' | 'outline'> = {
  created: 'secondary',
  confirmed: 'default',
  picking: 'warning',
  packed: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
  return_in_progress: 'outline',
}

const TYPE_LABEL: Record<string, string> = {
  pickup: 'Pickup',
  ship: 'Ship',
  carry_out: 'Carry Out',
}

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const sp = await searchParams
  const statusFilter = sp.status ?? ''
  const typeFilter = sp.type ?? ''

  const orders = await prisma.customerOrder.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(typeFilter ? { orderType: typeFilter } : {}),
    },
    include: { lines: true, fulfillments: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <>
      <TopBar title="Customer Orders" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Customer Orders</h2>
            <p className="text-sm text-zinc-500">{orders.length} orders</p>
          </div>
          <Link
            href="/customer-orders/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Customer Order
          </Link>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="text-xs text-zinc-500 self-center mr-1">Status:</span>
          {['', ...STATUS_FLOW].map((s) => (
            <Link
              key={s || 'all'}
              href={`/customer-orders?status=${s}&type=${typeFilter}`}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                statusFilter === s
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
          <span className="text-xs text-zinc-500 self-center ml-2 mr-1">Type:</span>
          {['', 'pickup', 'ship', 'carry_out'].map((t) => (
            <Link
              key={t || 'all'}
              href={`/customer-orders?status=${statusFilter}&type=${t}`}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                typeFilter === t
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {t ? TYPE_LABEL[t] : 'All'}
            </Link>
          ))}
        </div>

        {orders.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No customer orders found</p>
              <Link href="/customer-orders/new" className="mt-4 text-xs text-blue-400 hover:underline">
                Create your first order
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Order #</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-right pb-3 font-medium">Balance Due</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Fulfillments</th>
                  <th className="text-center pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{o.customerId}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs capitalize">
                      {TYPE_LABEL[o.orderType] ?? o.orderType}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={STATUS_BADGE[o.status] ?? 'secondary'} className="text-[10px]">
                        {o.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-400 text-xs">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="py-3 pr-4 text-right text-xs text-amber-400">
                      {formatCurrency(o.balanceDue)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(o.createdAt)}</td>
                    <td className="py-3 pr-4 text-zinc-500 text-xs">{o.fulfillments.length}</td>
                    <td className="py-3 text-center">
                      <Link
                        href={`/customer-orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Link>
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
