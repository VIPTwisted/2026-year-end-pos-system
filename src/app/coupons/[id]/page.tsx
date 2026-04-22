import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Tag, ArrowLeft } from 'lucide-react'
import { CouponActions } from './CouponActions'

export default async function CouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: {
      promotion: true,
      redemptions: {
        orderBy: { redeemedAt: 'desc' },
      },
      _count: { select: { redemptions: true } },
    },
  })

  if (!coupon) notFound()

  const now = new Date()
  const isExpired = !!(coupon.expiresAt && coupon.expiresAt < now)
  const isDepleted = coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit
  const status = !coupon.isActive ? 'inactive' : isExpired ? 'expired' : isDepleted ? 'depleted' : 'active'

  const STATUS_STYLE: Record<string, string> = {
    active:   'bg-emerald-500/10 text-emerald-400',
    expired:  'bg-red-500/10 text-red-400',
    depleted: 'bg-amber-500/10 text-amber-400',
    inactive: 'bg-zinc-700 text-zinc-400',
  }

  const isPercent = coupon.promotion.type === 'PERCENT_OFF'
  const totalDiscount = coupon.redemptions.reduce((s, r) => s + r.discount, 0)
  const avgOrderValue = coupon.redemptions.length > 0
    ? totalDiscount / coupon.redemptions.length
    : 0

  // Fetch orders for redemptions that have orderId
  const orderIds = coupon.redemptions.map(r => r.orderId).filter(Boolean) as string[]
  const orders = orderIds.length > 0
    ? await prisma.order.findMany({
        where: { id: { in: orderIds } },
        include: { customer: true },
      })
    : []
  const ordersMap = new Map(orders.map(o => [o.id, o]))

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={coupon.code}
        breadcrumb={[{ label: 'Coupon Codes', href: '/coupons' }]}
        actions={<CouponActions id={coupon.id} isActive={coupon.isActive} status={status} />}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Settings card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <Tag className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-zinc-100">Coupon Settings</span>
              <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLE[status]}`}>
                {status}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Code</dt>
                <dd className="font-mono text-lg font-bold text-blue-400">{coupon.code}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Type</dt>
                <dd className="text-zinc-200 text-sm">{isPercent ? 'Percentage Discount' : 'Fixed Amount Discount'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Value</dt>
                <dd className="text-zinc-100 text-xl font-bold tabular-nums">
                  {isPercent ? `${coupon.promotion.value}%` : formatCurrency(coupon.promotion.value)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Min Order</dt>
                <dd className="text-zinc-200 text-sm">
                  {coupon.promotion.minOrderAmount != null ? formatCurrency(coupon.promotion.minOrderAmount) : 'None'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Uses / Limit</dt>
                <dd className="text-zinc-200 text-sm tabular-nums">
                  {coupon.usedCount} / {coupon.usageLimit != null ? coupon.usageLimit : '∞'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Expires</dt>
                <dd className="text-zinc-200 text-sm">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Never'}
                </dd>
              </div>
              {coupon.description && (
                <div className="col-span-2">
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Description</dt>
                  <dd className="text-zinc-300 text-sm">{coupon.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Created</dt>
                <dd className="text-zinc-400 text-sm">
                  {new Date(coupon.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Usage stats */}
          <div className="space-y-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Redemptions</div>
              <div className="text-2xl font-bold text-zinc-100">{coupon._count.redemptions}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Discount Given</div>
              <div className="text-2xl font-bold text-zinc-100">{formatCurrency(totalDiscount)}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Avg Discount / Order</div>
              <div className="text-2xl font-bold text-zinc-100">{formatCurrency(avgOrderValue)}</div>
            </div>
          </div>
        </div>

        {/* Redemptions table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-100">Redemption History</span>
          </div>
          {coupon.redemptions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">No redemptions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Date', 'Order #', 'Customer', 'Discount Applied'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coupon.redemptions.map(r => {
                    const order = r.orderId ? ordersMap.get(r.orderId) : undefined
                    return (
                      <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-3 text-zinc-400 text-[12px]">
                          {new Date(r.redeemedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          {order ? (
                            <Link href={`/orders/${order.id}`} className="font-mono text-blue-400 hover:underline text-xs">
                              {order.orderNumber}
                            </Link>
                          ) : r.orderId ? (
                            <span className="font-mono text-zinc-500 text-xs">{r.orderId.substring(0, 8)}…</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-300 text-sm">
                          {order?.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : r.customerId
                              ? <span className="text-zinc-500 text-xs font-mono">{r.customerId.substring(0, 8)}…</span>
                              : <span className="text-zinc-600">Guest</span>}
                        </td>
                        <td className="px-4 py-3 font-semibold tabular-nums text-emerald-400">
                          {formatCurrency(r.discount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
