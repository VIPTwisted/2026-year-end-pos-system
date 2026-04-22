import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  processing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  shipped: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  returned: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
}

export default async function OnlineOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const activeStatus = sp.status || 'all'

  const orders = await prisma.onlineOrder.findMany({
    where: activeStatus !== 'all' ? { status: activeStatus } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      channel: { select: { id: true, name: true } },
      customer: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return (
    <>
      <TopBar title="Online Orders" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Online Orders</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{orders.length} orders</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1 flex-wrap mb-6">
          {STATUSES.map(s => (
            <Link
              key={s}
              href={s === 'all' ? '/ecommerce/orders' : `/ecommerce/orders?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                activeStatus === s
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Orders</span>
          <div className="flex-1 h-px bg-zinc-800/60" />
          <span className="text-[11px] text-zinc-600">{orders.length} shown</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-500">
            <ShoppingCart className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-[13px]">No orders found</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Order #</th>
                    <th className="text-left py-2.5 font-medium">Channel</th>
                    <th className="text-left py-2.5 font-medium">Customer</th>
                    <th className="text-left py-2.5 font-medium">Fulfillment</th>
                    <th className="text-right py-2.5 font-medium">Total</th>
                    <th className="text-right py-2.5 font-medium">Shipping</th>
                    <th className="text-center py-2.5 font-medium">Status</th>
                    <th className="text-right px-4 py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, idx) => (
                    <tr
                      key={o.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== orders.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-[13px] text-blue-400">
                        <Link href={`/ecommerce/orders/${o.id}`} className="hover:underline">{o.orderNumber}</Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-[11px]">{o.channel.name}</td>
                      <td className="py-2.5 pr-4 text-zinc-300 text-[13px]">
                        {o.customer
                          ? `${o.customer.firstName} ${o.customer.lastName}`
                          : (o.guestName || o.guestEmail || 'Guest')}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-[11px] capitalize">{o.fulfillmentType}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-emerald-400 tabular-nums">{formatCurrency(o.total)}</td>
                      <td className="py-2.5 pr-4 text-right text-zinc-400 tabular-nums">{formatCurrency(o.shippingCost)}</td>
                      <td className="py-2.5 pr-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${STATUS_BADGE[o.status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-500 text-[11px]">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
