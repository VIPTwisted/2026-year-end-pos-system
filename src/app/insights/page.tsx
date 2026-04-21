import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  // Tier distribution
  const vipCount = allCustomers.filter(c => (c.loyaltyPoints ?? 0) > 500).length
  const activeCount = allCustomers.filter(c => {
    const pts = c.loyaltyPoints ?? 0
    return pts >= 100 && pts <= 500
  }).length
  const newTierCount = allCustomers.filter(c => (c.loyaltyPoints ?? 0) < 100).length
  const repeatCustomers = allCustomers.filter(c => (c.visitCount ?? 0) > 1).length

  // Avg LTV
  const avgLtv = allCustomers.length > 0
    ? allCustomers.reduce((sum, c) => sum + (c.totalSpent ?? 0), 0) / allCustomers.length
    : 0

  // Top 5 cities
  const cityMap: Record<string, number> = {}
  for (const c of allCustomers) {
    if (c.city) cityMap[c.city] = (cityMap[c.city] ?? 0) + 1
  }
  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Credit risk
  const creditMap: Record<string, number> = {}
  for (const row of creditCounts) {
    creditMap[row.creditStatus ?? 'good'] = row._count.id
  }

  const tierTotal = totalCustomers > 0 ? totalCustomers : 1

  return (
    <>
      <TopBar title="Customer Insights" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Customers</p>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{totalCustomers}</p>
              <p className="text-xs text-zinc-600 mt-1">+{newCustomers} last 30 days</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Order Value</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(orderStats._avg.totalAmount ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg LTV</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(avgLtv)}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Repeat Customers</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{repeatCustomers}</p>
              <p className="text-xs text-zinc-600 mt-1">visit count &gt; 1</p>
            </CardContent>
          </Card>
        </div>

        {/* Two-col section: Tier Distribution + Credit Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tier Distribution */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Customer Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'VIP', count: vipCount, desc: 'loyalty > 500 pts', color: 'bg-amber-400', textColor: 'text-amber-400' },
                { label: 'Active', count: activeCount, desc: '100–500 pts', color: 'bg-blue-400', textColor: 'text-blue-400' },
                { label: 'New', count: newTierCount, desc: '< 100 pts', color: 'bg-zinc-500', textColor: 'text-zinc-400' },
              ].map(tier => {
                const pct = Math.round((tier.count / tierTotal) * 100)
                return (
                  <div key={tier.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${tier.textColor}`}>{tier.label}</span>
                        <span className="text-xs text-zinc-600">{tier.desc}</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-200 tabular-nums">
                        {tier.count} <span className="text-zinc-500 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${tier.color} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Credit Risk */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-zinc-500" />
                <CardTitle className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Credit Risk Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-emerald-400">{creditMap['good'] ?? 0}</p>
                  <p className="text-xs text-zinc-500 mt-1">Good</p>
                </div>
                <div className="text-center bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-amber-400">{creditMap['warning'] ?? 0}</p>
                  <p className="text-xs text-zinc-500 mt-1">Warning</p>
                </div>
                <div className="text-center bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-400">{creditMap['hold'] ?? 0}</p>
                  <p className="text-xs text-zinc-500 mt-1">Hold</p>
                </div>
              </div>

              {/* Top Cities */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Top Cities</p>
                </div>
                {topCities.length === 0 ? (
                  <p className="text-xs text-zinc-600">No city data</p>
                ) : (
                  <div className="space-y-1.5">
                    {topCities.map(([city, count]) => (
                      <div key={city} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">{city}</span>
                        <span className="text-sm font-semibold text-zinc-100 tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top 10 Customers */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Top 10 Customers by LTV</h2>
              <p className="text-sm text-zinc-500">Ranked by total spend</p>
            </div>
            <Link href="/insights/recommendations" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Product Intelligence →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Rank</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Email</th>
                  <th className="text-right pb-3 font-medium">Total Spent</th>
                  <th className="text-center pb-3 font-medium">Visits</th>
                  <th className="text-right pb-3 font-medium">Loyalty Pts</th>
                  <th className="text-center pb-3 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {topCustomers.map((c, i) => {
                  const pts = c.loyaltyPoints ?? 0
                  const tier = pts > 500 ? 'VIP' : pts >= 100 ? 'Active' : 'New'
                  const tierVariant = tier === 'VIP' ? 'warning' : tier === 'Active' ? 'default' : 'secondary'
                  return (
                    <tr key={c.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 text-zinc-500 font-mono text-xs">#{i + 1}</td>
                      <td className="py-3 pr-4 font-medium text-zinc-100">
                        <Link href={`/customers/${c.id}`} className="hover:text-blue-400 transition-colors">
                          {c.firstName} {c.lastName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{c.email}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400 tabular-nums">
                        {formatCurrency(c.totalSpent ?? 0)}
                      </td>
                      <td className="py-3 pr-4 text-center text-zinc-300 tabular-nums">{c.visitCount ?? 0}</td>
                      <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums">{pts.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <Badge variant={tierVariant as 'warning' | 'default' | 'secondary'}>{tier}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </>
  )
}
