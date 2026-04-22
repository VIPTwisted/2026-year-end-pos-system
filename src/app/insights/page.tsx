export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Users, TrendingUp, Star, AlertTriangle, MapPin, BarChart3 } from 'lucide-react'

export default async function InsightsPage() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [totalCustomers, orderStats, topCustomers, newCustomers, allCustomers, creditCounts] = await Promise.all([
    prisma.customer.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      _avg: { totalAmount: true },
      _sum: { totalAmount: true },
    }),
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { totalSpent: 'desc' },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalSpent: true,
        visitCount: true,
        loyaltyPoints: true,
      },
    }),
    prisma.customer.count({
      where: {
        isActive: true,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.customer.findMany({
      where: { isActive: true },
      select: {
        loyaltyPoints: true,
        visitCount: true,
        city: true,
        totalSpent: true,
      },
    }),
    prisma.customer.groupBy({
      by: ['creditStatus'],
      _count: { id: true },
    }),
  ])

  const vipCount = allCustomers.filter(c => (c.loyaltyPoints ?? 0) > 500).length
  const activeCount = allCustomers.filter(c => {
    const pts = c.loyaltyPoints ?? 0
    return pts >= 100 && pts <= 500
  }).length
  const newTierCount = allCustomers.filter(c => (c.loyaltyPoints ?? 0) < 100).length
  const repeatCustomers = allCustomers.filter(c => (c.visitCount ?? 0) > 1).length
  const avgLtv = allCustomers.length > 0
    ? allCustomers.reduce((sum, c) => sum + (c.totalSpent ?? 0), 0) / allCustomers.length
    : 0

  const cityMap: Record<string, number> = {}
  for (const c of allCustomers) {
    if (c.city) cityMap[c.city] = (cityMap[c.city] ?? 0) + 1
  }
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCity = topCities[0]?.[1] ?? 1

  const creditMap: Record<string, number> = {}
  for (const row of creditCounts) {
    creditMap[row.creditStatus ?? 'good'] = row._count.id
  }

  const tierTotal = totalCustomers > 0 ? totalCustomers : 1

  const kpis = [
    { label: 'Total Customers', value: totalCustomers.toString(), sub: `+${newCustomers} last 30d`, accent: 'bg-blue-500' },
    { label: 'Avg Order Value', value: formatCurrency(orderStats._avg.totalAmount ?? 0), sub: null, accent: 'bg-emerald-500' },
    { label: 'Avg LTV', value: formatCurrency(avgLtv), sub: null, accent: 'bg-violet-500' },
    { label: 'Repeat Customers', value: repeatCustomers.toString(), sub: 'visit count > 1', accent: 'bg-amber-500' },
  ]

  return (
    <>
      <TopBar title="Customer Insights" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Customer Insights</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{totalCustomers} active customers · analytics overview</p>
          </div>
          <Link
            href="/insights/recommendations"
            className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
          >
            Product Intelligence →
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className={`h-[3px] w-full ${k.accent}`} />
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{k.label}</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">{k.value}</p>
                {k.sub && <p className="text-[11px] text-zinc-600 mt-0.5">{k.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Tier Distribution */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">Customer Tier Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'VIP', count: vipCount, desc: 'loyalty > 500 pts', barColor: 'bg-amber-400', textColor: 'text-amber-400' },
                { label: 'Active', count: activeCount, desc: '100–500 pts', barColor: 'bg-blue-400', textColor: 'text-blue-400' },
                { label: 'New', count: newTierCount, desc: '< 100 pts', barColor: 'bg-zinc-500', textColor: 'text-zinc-400' },
              ].map(tier => {
                const pct = Math.round((tier.count / tierTotal) * 100)
                return (
                  <div key={tier.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-semibold ${tier.textColor}`}>{tier.label}</span>
                        <span className="text-[11px] text-zinc-600">{tier.desc}</span>
                      </div>
                      <span className="text-[13px] font-bold text-zinc-200 tabular-nums">
                        {tier.count} <span className="text-zinc-500 font-normal text-[11px]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-4 bg-zinc-800 rounded-r overflow-hidden">
                      <div className={`h-full ${tier.barColor} rounded-r transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Credit Risk + Top Cities */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Credit Risk Breakdown</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30">
                <p className="text-2xl font-bold text-emerald-400 tabular-nums">{creditMap['good'] ?? 0}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Good</p>
              </div>
              <div className="text-center bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30">
                <p className="text-2xl font-bold text-amber-400 tabular-nums">{creditMap['warning'] ?? 0}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Warning</p>
              </div>
              <div className="text-center bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30">
                <p className="text-2xl font-bold text-red-400 tabular-nums">{creditMap['hold'] ?? 0}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Hold</p>
              </div>
            </div>

            {/* Top Cities */}
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Top Cities</p>
            </div>
            {topCities.length === 0 ? (
              <p className="text-[11px] text-zinc-600">No city data</p>
            ) : (
              <div className="space-y-2">
                {topCities.map(([city, count]) => (
                  <div key={city}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] text-zinc-300">{city}</span>
                      <span className="text-[13px] font-semibold text-zinc-100 tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-r overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-r"
                        style={{ width: `${(count / maxCity) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top 10 Customers */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Top 10 Customers by LTV</span>
          <div className="flex-1 h-px bg-zinc-800/60" />
          <span className="text-[11px] text-zinc-600">ranked by total spend</span>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5 font-medium">Rank</th>
                  <th className="text-left py-2.5 font-medium">Customer</th>
                  <th className="text-left py-2.5 font-medium">Email</th>
                  <th className="text-right py-2.5 font-medium">Total Spent</th>
                  <th className="text-center py-2.5 font-medium">Visits</th>
                  <th className="text-right py-2.5 font-medium">Loyalty Pts</th>
                  <th className="text-center px-4 py-2.5 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => {
                  const pts = c.loyaltyPoints ?? 0
                  const tier = pts > 500 ? 'VIP' : pts >= 100 ? 'Active' : 'New'
                  const tierStyle =
                    tier === 'VIP'
                      ? 'bg-yellow-600/15 text-yellow-600 border-yellow-600/30'
                      : tier === 'Active'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${i !== topCustomers.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-zinc-500 font-mono text-[11px]">#{i + 1}</td>
                      <td className="py-2.5 pr-4 font-medium text-zinc-100">
                        <Link href={`/customers/${c.id}`} className="hover:text-blue-400 transition-colors">
                          {c.firstName} {c.lastName}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-[11px]">{c.email}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-emerald-400 tabular-nums">
                        {formatCurrency(c.totalSpent ?? 0)}
                      </td>
                      <td className="py-2.5 pr-4 text-center text-zinc-300 tabular-nums">{c.visitCount ?? 0}</td>
                      <td className="py-2.5 pr-4 text-right text-emerald-400 font-bold tabular-nums">{pts.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${tierStyle}`}>
                          {tier}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  )
}
