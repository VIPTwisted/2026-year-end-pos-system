export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Tag, Plus, Zap, TrendingDown, Gift } from 'lucide-react'
import { PromotionActions } from './PromotionActions'

const TYPE_META: Record<string, { label: string; color: string }> = {
  PERCENT_OFF:    { label: 'Percentage',    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  AMOUNT_OFF:     { label: 'Fixed $',       color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  BOGO:           { label: 'Mix & Match',   color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  FREE_ITEM:      { label: 'Free Item',     color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  TIERED_SPEND:   { label: 'Tiered Spend', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  LOYALTY_BONUS:  { label: 'Loyalty',      color: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
}

function promoStatus(p: { isActive: boolean; startDate: Date | null; endDate: Date | null }) {
  const now = new Date()
  if (!p.isActive) return 'inactive'
  if (p.startDate && p.startDate > now) return 'scheduled'
  if (p.endDate && p.endDate < now) return 'expired'
  return 'active'
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  scheduled: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  expired: 'bg-red-500/15 text-red-400 border-red-500/30',
  inactive: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; type?: string }>
}) {
  const { filter, type } = await searchParams

  const [promotions, thisMonthStats] = await Promise.all([
    prisma.promotion.findMany({
      include: { _count: { select: { coupons: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.couponRedemption.aggregate({
      _sum: { discount: true },
      _count: { id: true },
      where: {
        redeemedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ])

  const activeCoupons = await prisma.coupon.count({ where: { isActive: true } })

  const now = new Date()
  const activeCount = promotions.filter(p => p.isActive && (!p.startDate || p.startDate <= now) && (!p.endDate || p.endDate >= now)).length

  let filtered = promotions
  if (filter === 'active') filtered = promotions.filter(p => promoStatus(p) === 'active')
  else if (filter === 'scheduled') filtered = promotions.filter(p => promoStatus(p) === 'scheduled')
  else if (filter === 'expired') filtered = promotions.filter(p => promoStatus(p) === 'expired')
  else if (filter === 'inactive') filtered = promotions.filter(p => promoStatus(p) === 'inactive')
  if (type) filtered = filtered.filter(p => p.type === type)

  const kpis = [
    { label: 'Active Promotions', value: activeCount.toString(), accent: 'bg-blue-500' },
    { label: 'Total Uses (All Time)', value: promotions.reduce((s, p) => s + p.usedCount, 0).toLocaleString(), accent: 'bg-emerald-500' },
    { label: 'Savings This Month', value: formatCurrency(thisMonthStats._sum.discount ?? 0), accent: 'bg-amber-500' },
    { label: 'Active Coupons', value: activeCoupons.toLocaleString(), accent: 'bg-violet-500' },
  ]

  const filterTabs = [
    { key: '', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'expired', label: 'Expired' },
    { key: 'inactive', label: 'Inactive' },
  ]

  return (
    <>
      <TopBar title="Promotions & Discounts" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Promotions & Discounts</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{promotions.length} promotions · {activeCount} active</p>
          </div>
          <Link
            href="/promotions/new"
            className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />New Promotion
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className={`h-[3px] w-full ${k.accent}`} />
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{k.label}</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-1 mb-6 w-fit">
          {filterTabs.map(f => (
            <Link
              key={f.key}
              href={`/promotions${f.key ? `?filter=${f.key}` : ''}`}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                (filter ?? '') === f.key
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Promotions</span>
          <div className="flex-1 h-px bg-zinc-800/60" />
          <span className="text-[11px] text-zinc-600">{filtered.length} shown</span>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5 font-medium">Name</th>
                  <th className="text-center py-2.5 font-medium">Type</th>
                  <th className="text-center py-2.5 font-medium">Scope</th>
                  <th className="text-center py-2.5 font-medium">Value</th>
                  <th className="text-center py-2.5 font-medium">Min Order</th>
                  <th className="text-center py-2.5 font-medium">Usage</th>
                  <th className="text-center py-2.5 font-medium">Date Range</th>
                  <th className="text-center py-2.5 font-medium">Auto-Apply</th>
                  <th className="text-center py-2.5 font-medium">Status</th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-zinc-600 text-[13px]">
                      No promotions found.{' '}
                      <Link href="/promotions/new" className="text-blue-400 hover:underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => {
                    const status = promoStatus(p)
                    const meta = TYPE_META[p.type] ?? { label: p.type, color: 'bg-zinc-700 text-zinc-300 border-zinc-600' }
                    const valueLabel = p.type === 'PERCENT_OFF' ? `${p.value}%` : formatCurrency(p.value)

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-zinc-800/30 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/promotions/${p.id}`}
                            className="font-medium text-zinc-100 hover:text-blue-400 transition-colors"
                          >
                            {p.name}
                          </Link>
                          {p.isExclusive && (
                            <span className="ml-2 text-[11px] text-amber-500 font-mono">EXCLUSIVE</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${meta.color}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-[11px] text-zinc-400 capitalize">{p.scope}</td>
                        <td className="py-2.5 text-center font-mono text-zinc-200">{valueLabel}</td>
                        <td className="py-2.5 text-center text-[11px] text-zinc-400">
                          {p.minOrderAmount != null ? formatCurrency(p.minOrderAmount) : '—'}
                        </td>
                        <td className="py-2.5 text-center text-[11px] text-zinc-400">
                          {p.usedCount}{p.usageLimit != null ? `/${p.usageLimit}` : ''}
                        </td>
                        <td className="py-2.5 text-center text-[11px] text-zinc-500">
                          {p.startDate || p.endDate ? (
                            <span>
                              {p.startDate ? formatDate(p.startDate) : '∞'} — {p.endDate ? formatDate(p.endDate) : '∞'}
                            </span>
                          ) : (
                            <span className="text-zinc-600">Always</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          {p.autoApply ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              <Zap className="w-3 h-3 mr-1" />Auto
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-600">Manual</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${STATUS_STYLE[status]}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/promotions/${p.id}`} className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors">View</Link>
                            <PromotionActions id={p.id} isActive={p.isActive} />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  )
}
