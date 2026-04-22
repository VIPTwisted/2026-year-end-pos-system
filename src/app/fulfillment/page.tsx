import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  Package, Truck, CheckCircle2, ClipboardList,
  Clock, MapPin, ArrowRight,
} from 'lucide-react'

const STATUS_TABS = ['pending', 'picking', 'packing', 'shipped'] as const
type StatusTab = typeof STATUS_TABS[number]

const TAB_LABEL: Record<StatusTab, string> = {
  pending: 'Pending',
  picking: 'Picking',
  packing: 'Packing',
  shipped: 'Shipped',
}

const FULFILLMENT_BADGE: Record<string, 'secondary' | 'warning' | 'default' | 'success' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  picking: 'warning',
  packing: 'warning',
  packed: 'default',
  shipped: 'default',
  delivered: 'success',
}

export default async function FulfillmentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const sp = await searchParams
  const tab = (sp.tab ?? 'pending') as StatusTab

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [pendingCount, packingToday, shippedToday, deliveredToday, fulfillments] =
    await Promise.all([
      prisma.orderFulfillment.count({ where: { status: 'pending' } }),
      prisma.orderFulfillment.count({
        where: { status: 'packed', packedAt: { gte: today, lt: tomorrow } },
      }),
      prisma.orderFulfillment.count({
        where: { status: 'shipped', shippedAt: { gte: today, lt: tomorrow } },
      }),
      prisma.orderFulfillment.count({
        where: { status: 'delivered', deliveredAt: { gte: today, lt: tomorrow } },
      }),
      prisma.orderFulfillment.findMany({
        where: {
          status:
            tab === 'packing'
              ? { in: ['packing', 'packed'] }
              : tab,
        },
        include: { order: { include: { lines: true } } },
        orderBy: { createdAt: 'asc' },
        take: 100,
      }),
    ])

  const kpis = [
    { label: 'Pending Pick', value: pendingCount, icon: ClipboardList, color: 'text-amber-400' },
    { label: 'Packing Today', value: packingToday, icon: Package, color: 'text-blue-400' },
    { label: 'Shipped Today', value: shippedToday, icon: Truck, color: 'text-purple-400' },
    { label: 'Delivered Today', value: deliveredToday, icon: CheckCircle2, color: 'text-emerald-400' },
  ]

  return (
    <>
      <TopBar title="Fulfillment Hub" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((k) => (
            <Card key={k.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 flex items-center gap-3">
                <k.icon className={`w-8 h-8 ${k.color} shrink-0`} />
                <div>
                  <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
                  <div className="text-xs text-zinc-500">{k.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-1 mb-4 border-b border-zinc-800 pb-0">
          {STATUS_TABS.map((t) => (
            <Link
              key={t}
              href={`/fulfillment?tab=${t}`}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                tab === t
                  ? 'bg-zinc-800 text-zinc-100 border-b-2 border-blue-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {TAB_LABEL[t]}
            </Link>
          ))}
        </div>

        {fulfillments.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Package className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No fulfillments in this queue</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {fulfillments.map((f) => {
              const order = f.order
              const itemCount = order.lines.length
              const typeIcon =
                order.orderType === 'ship' ? <Truck className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />
              return (
                <Card key={f.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-zinc-300 font-semibold">
                          {f.fulfillmentNo}
                        </span>
                        <Badge variant={FULFILLMENT_BADGE[f.status] ?? 'secondary'} className="text-[10px]">
                          {f.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-zinc-500 capitalize">
                          {typeIcon}
                          {order.orderType}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        Order: <span className="text-zinc-300 font-mono">{order.orderNumber}</span>
                        {' · '}
                        Customer: <span className="text-zinc-300">{order.customerId}</span>
                        {' · '}
                        <span className="text-zinc-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                      </div>
                      {order.requestedDate && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-400">
                          <Clock className="w-3 h-3" />
                          Requested: {formatDate(order.requestedDate)}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/fulfillment/${f.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shrink-0"
                    >
                      Process <ArrowRight className="w-3 h-3" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
