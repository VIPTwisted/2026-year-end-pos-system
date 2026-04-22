export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Tag, Plus, TicketPercent, AlertCircle } from 'lucide-react'

interface CouponWithPromotion {
  id: string
  code: string
  isActive: boolean
  usedCount: number
  usageLimit: number | null
  expiresAt: Date | null
  description: string | null
  createdAt: Date
  promotion: {
    type: string
    value: number
    minOrderAmount: number | null
  }
  _count: { redemptions: number }
}

function couponStatus(c: CouponWithPromotion): 'active' | 'expired' | 'depleted' | 'inactive' {
  if (!c.isActive) return 'inactive'
  if (c.expiresAt && c.expiresAt < new Date()) return 'expired'
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return 'depleted'
  return 'active'
}

const STATUS_STYLE: Record<string, string> = {
  active:   'bg-emerald-500/10 text-emerald-400',
  expired:  'bg-red-500/10 text-red-400',
  depleted: 'bg-amber-500/10 text-amber-400',
  inactive: 'bg-zinc-700 text-zinc-400',
}

export default async function CouponsPage() {
  const [coupons, redemptionAgg] = await Promise.all([
    prisma.coupon.findMany({
      include: {
        promotion: true,
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.couponRedemption.aggregate({
      _sum: { discount: true },
      _count: { id: true },
    }),
  ])

  const now = new Date()
  const totalCoupons = coupons.length
  const activeCoupons = coupons.filter(c => c.isActive && (!c.expiresAt || c.expiresAt >= now) && (c.usageLimit == null || c.usedCount < c.usageLimit)).length
  const totalRedeemed = coupons.reduce((s, c) => s + c.usedCount, 0)
  const totalDiscountGiven = redemptionAgg._sum.discount ?? 0

  const stats = [
    { label: 'Total Coupons', value: totalCoupons.toLocaleString(), sub: 'all time' },
    { label: 'Active Coupons', value: activeCoupons.toLocaleString(), sub: 'usable now' },
    { label: 'Total Redemptions', value: totalRedeemed.toLocaleString(), sub: 'all time' },
    { label: 'Total Discount Given', value: formatCurrency(totalDiscountGiven), sub: 'from redemptions' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Coupon Codes"
        actions={
          <Link
            href="/coupons/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Coupon
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-zinc-100">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-zinc-100">All Coupons</span>
            <span className="ml-auto text-xs text-zinc-500">{totalCoupons} total</span>
          </div>

          {coupons.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-zinc-500">
              <TicketPercent className="w-10 h-10 opacity-30" />
              <p className="text-sm">No coupon codes yet.</p>
              <Link href="/coupons/new" className="text-sm text-blue-400 hover:underline">Create your first coupon</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Code', 'Type', 'Value', 'Min Order', 'Uses / Max', 'Expires', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => {
                    const status = couponStatus(c as CouponWithPromotion)
                    const isPercent = c.promotion.type === 'PERCENT_OFF'
                    return (
                      <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/coupons/${c.id}`} className="font-mono text-blue-400 hover:underline text-sm">
                            {c.code}
                          </Link>
                          {c.description && (
                            <div className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[180px]">{c.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">
                          {isPercent ? 'Percentage' : 'Fixed Amount'}
                        </td>
                        <td className="px-4 py-3 font-semibold tabular-nums text-zinc-100">
                          {isPercent ? `${c.promotion.value}%` : formatCurrency(c.promotion.value)}
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {c.promotion.minOrderAmount != null ? formatCurrency(c.promotion.minOrderAmount) : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-300 tabular-nums">
                          {c.usedCount} / {c.usageLimit != null ? c.usageLimit : <span className="text-zinc-500">∞</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-[12px]">
                          {c.expiresAt
                            ? new Date(c.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : <span className="text-zinc-600">Never</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLE[status]}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/coupons/${c.id}`}
                              className="text-[12px] text-blue-400 hover:underline"
                            >
                              View
                            </Link>
                            {status === 'active' && (
                              <DeactivateButton id={c.id} />
                            )}
                          </div>
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

// Inline client action component
function DeactivateButton({ id }: { id: string }) {
  // This is a server component; we use a form for inline POST-style action
  return (
    <Link
      href={`/coupons/${id}`}
      className="text-[12px] text-red-400 hover:underline"
    >
      Deactivate
    </Link>
  )
}
