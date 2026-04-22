export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Tag, Gift, Calendar, BarChart2, ShieldCheck, Zap } from 'lucide-react'
import { PromotionDetailActions } from './PromotionDetailActions'

const TYPE_LABEL: Record<string, string> = {
  PERCENT_OFF: 'Percent Off',
  AMOUNT_OFF: 'Amount Off',
  BOGO: 'Buy X Get Y',
  FREE_ITEM: 'Free Item',
  TIERED_SPEND: 'Tiered Spend',
  LOYALTY_BONUS: 'Loyalty Bonus',
}

function promoStatus(p: { isActive: boolean; startDate: Date | null; endDate: Date | null }) {
  const now = new Date()
  if (!p.isActive) return 'inactive'
  if (p.startDate && p.startDate > now) return 'scheduled'
  if (p.endDate && p.endDate < now) return 'expired'
  return 'active'
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  active: 'success', scheduled: 'warning', expired: 'destructive', inactive: 'secondary',
}

type Coupon = {
  id: string
  code: string
  isActive: boolean
  usedCount: number
  usageLimit: number | null
  expiresAt: Date | null
  createdAt: Date
  _count: { redemptions: number }
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const promo = await prisma.promotion.findUnique({
    where: { id },
    include: {
      coupons: {
        include: { _count: { select: { redemptions: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!promo) notFound()

  const status = promoStatus(promo)
  const usagePct = promo.usageLimit ? Math.min(100, (promo.usedCount / promo.usageLimit) * 100) : null

  const valueLabel =
    promo.type === 'PERCENT_OFF' ? `${promo.value}%` : formatCurrency(promo.value)

  return (
    <>
      <TopBar title={promo.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/promotions" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Promotions
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold text-zinc-100">{promo.name}</span>
                  <Badge variant={STATUS_VARIANT[status]} className="capitalize">{status}</Badge>
                  {promo.isExclusive && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Exclusive
                    </Badge>
                  )}
                </div>
                {promo.description && <p className="text-sm text-zinc-400">{promo.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{TYPE_LABEL[promo.type] ?? promo.type}</span>
                  <span className="capitalize">Scope: {promo.scope}</span>
                  <span>Priority: {promo.priority}</span>
                  {promo.coupons.length > 0 && (
                    <span className="flex items-center gap-1"><Gift className="w-3 h-3" />{promo.coupons.length} coupon codes</span>
                  )}
                </div>
              </div>

              <PromotionDetailActions promoId={promo.id} isActive={promo.isActive} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Rules summary */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-zinc-400" />
                  Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[
                    { label: 'Type', value: TYPE_LABEL[promo.type] ?? promo.type },
                    { label: 'Discount Value', value: valueLabel },
                    { label: 'Scope', value: promo.scope },
                    { label: 'Min Order', value: promo.minOrderAmount != null ? formatCurrency(promo.minOrderAmount) : '—' },
                    { label: 'Min Qty', value: promo.minQuantity != null ? String(promo.minQuantity) : '—' },
                    { label: 'Max Discount', value: promo.maxDiscount != null ? formatCurrency(promo.maxDiscount) : '—' },
                    ...(promo.type === 'BOGO' ? [
                      { label: 'Buy Qty', value: String(promo.buyQuantity ?? '—') },
                      { label: 'Get Qty (Free)', value: String(promo.getQuantity ?? '—') },
                    ] : []),
                    { label: 'Per-Customer Limit', value: promo.perCustomerLimit != null ? String(promo.perCustomerLimit) : 'Unlimited' },
                    { label: 'Exclusive', value: promo.isExclusive ? 'Yes' : 'No' },
                    ...(promo.targetProductId ? [{ label: 'Target Product', value: promo.targetProductId }] : []),
                    ...(promo.targetCategoryId ? [{ label: 'Target Category', value: promo.targetCategoryId }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col">
                      <dt className="text-xs text-zinc-500 uppercase tracking-wide">{label}</dt>
                      <dd className="text-zinc-200 font-medium mt-0.5">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {/* Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-zinc-400" />
                  Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-zinc-100">{promo.usedCount.toLocaleString()}</span>
                  <span className="text-xs text-zinc-500">{promo.usageLimit != null ? `of ${promo.usageLimit} total uses` : 'unlimited uses'}</span>
                </div>
                {usagePct !== null && (
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Date range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Start Date</p>
                <p className="text-zinc-200">{promo.startDate ? formatDate(promo.startDate) : 'Immediately'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">End Date</p>
                <p className="text-zinc-200">{promo.endDate ? formatDate(promo.endDate) : 'No expiry'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Store Restriction</p>
                <p className="text-zinc-400 text-xs">{promo.allowedStoreIds ?? 'All stores'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Created</p>
                <p className="text-zinc-400 text-xs">{formatDate(promo.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coupons table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-zinc-400" />
                Coupon Codes ({promo.coupons.length})
              </CardTitle>
              <PromotionDetailActions promoId={promo.id} isActive={promo.isActive} showGenerateOnly />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {promo.coupons.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-600 text-sm">
                No coupon codes — this promotion auto-applies.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Code', 'Uses', 'Limit', 'Expires', 'Status'].map(h => (
                        <th key={h} className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Code' ? 'text-left' : 'text-center'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {promo.coupons.map((c: Coupon) => {
                      const expired = c.expiresAt && c.expiresAt < new Date()
                      const limitHit = c.usageLimit != null && c.usedCount >= c.usageLimit
                      const couponStatus = !c.isActive ? 'inactive' : expired ? 'expired' : limitHit ? 'exhausted' : 'active'
                      const couponVariant = couponStatus === 'active' ? 'success' : couponStatus === 'inactive' ? 'secondary' : 'destructive'
                      return (
                        <tr key={c.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                          <td className="px-4 py-2.5 font-mono text-xs text-zinc-200 tracking-widest">{c.code}</td>
                          <td className="px-4 py-2.5 text-center text-zinc-400">{c.usedCount}</td>
                          <td className="px-4 py-2.5 text-center text-zinc-400">{c.usageLimit ?? '∞'}</td>
                          <td className="px-4 py-2.5 text-center text-xs text-zinc-500">{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge variant={couponVariant} className="capitalize text-xs">{couponStatus}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
