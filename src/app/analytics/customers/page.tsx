export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Users, TrendingUp, Repeat, DollarSign, Crown } from 'lucide-react'

/* ── helpers ─────────────────────────────────────────────────── */
function formatDateShort(d: Date | string | null): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d))
}

function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  )
}

/* ── page ─────────────────────────────────────────────────────── */
export default async function CustomerAnalyticsPage() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  /* ── KPI queries (parallel) ─────────────────────────────────── */
  const [
    totalCustomers,
    newThisMonth,
    repeatCustomers,
    avgOrderValue,
    topCustomers,
    monthlyCustomerOrders,
  ] = await Promise.all([
    /* 1 — total customers */
    prisma.customer.count({ where: { isActive: true } }),

    /* 2 — new this month */
    prisma.customer.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),

    /* 3 — repeat customers (more than 1 order) */
    prisma.customer.count({
      where: {
        orders: { some: {} },
        AND: [
          {
            orders: {
              some: {
                id: { not: undefined },
              },
            },
          },
        ],
      },
    }),

    /* 4 — avg order value */
    prisma.order.aggregate({ _avg: { totalAmount: true } }),

    /* 5 — top 20 by lifetime spent */
    prisma.customer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalSpent: true,
        visitCount: true,
        createdAt: true,
        loyaltyCard: {
          select: {
            tier: { select: { name: true, color: true } },
          },
        },
        orders: {
          select: { id: true, totalAmount: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { totalSpent: 'desc' },
      take: 20,
    }),

    /* 6 — orders per month last 6 months */
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, customer: { select: { createdAt: true } } },
    }),
  ])

  /* ── derive repeat count properly ──────────────────────────── */
  // We'll count customers where _count orders > 1 separately
  const repeatCount = await prisma.customer.count({
    where: {
      orders: { some: {} },
    },
  })

  /* Build per-customer order count to find true repeats */
  const customersWithOrderCount = await prisma.customer.findMany({
    where: { orders: { some: {} } },
    select: { id: true, _count: { select: { orders: true } } },
  })
  const trueRepeatCount = customersWithOrderCount.filter(c => c._count.orders > 1).length

  /* ── monthly trend buckets ─────────────────────────────────── */
  interface MonthBucket {
    label: string
    orders: number
    newCustomers: number
  }

  const buckets: MonthBucket[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ label: monthLabel(d.getFullYear(), d.getMonth() + 1), orders: 0, newCustomers: 0 })
  }

  for (const o of monthlyCustomerOrders) {
    const d = new Date(o.createdAt)
    const idx = buckets.findIndex(b => {
      const bd = new Date(`${b.label}`)
      return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth()
    })
    if (idx !== -1) buckets[idx].orders++
    if (o.customer?.createdAt) {
      const cd = new Date(o.customer.createdAt)
      const cidx = buckets.findIndex(b => {
        const bd = new Date(`${b.label}`)
        return bd.getFullYear() === cd.getFullYear() && bd.getMonth() === cd.getMonth()
      })
      if (cidx !== -1) buckets[cidx].newCustomers++
    }
  }

  const avgOV = avgOrderValue._avg.totalAmount ?? 0

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <>
      <TopBar title="Customer Analytics" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/analytics" className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">Analytics</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-300">Customers</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Customer Analytics</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Lifetime value, acquisition trends, and loyalty data — live from Prisma</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total Customers</span>
            </div>
            <div className="text-3xl font-bold text-zinc-100 tabular-nums">{totalCustomers.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">Active accounts</div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">New This Month</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400 tabular-nums">{newThisMonth.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">Last 30 days</div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Repeat className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Repeat Customers</span>
            </div>
            <div className="text-3xl font-bold text-amber-400 tabular-nums">{trueRepeatCount.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">2+ orders placed</div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Avg Order Value</span>
            </div>
            <div className="text-3xl font-bold text-purple-400 tabular-nums">{formatCurrency(avgOV)}</div>
            <div className="text-xs text-zinc-500 mt-1">All-time average</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Top Customers table */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Top Customers by Lifetime Value</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-10">#</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Orders</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total Spent</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Order</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, i) => {
                    const lastOrder = c.orders[0]
                    const tier = c.loyaltyCard?.tier
                    return (
                      <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-4 text-zinc-500 font-mono text-xs">{i + 1}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/customers/${c.id}`}
                            className="text-zinc-100 hover:text-blue-400 transition-colors font-medium text-[13px]"
                          >
                            {c.firstName} {c.lastName}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-zinc-300 text-[13px]">
                          {c.orders.length}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-semibold text-emerald-400 text-[13px]">
                          {formatCurrency(c.totalSpent)}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 text-[12px]">
                          {lastOrder ? formatDateShort(lastOrder.createdAt) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {tier ? (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                              style={{ backgroundColor: `${tier.color ?? ''}22`, color: tier.color ?? undefined }}
                            >
                              {tier.name}
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {topCustomers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-600 text-[13px]">No customers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Acquisition Trend */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">6-Month Trend</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/50">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Month</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">Orders</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">New Cust.</span>
                </div>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {buckets.map(b => (
                  <div key={b.label} className="px-4 py-3 grid grid-cols-3 gap-2 hover:bg-zinc-800/20 transition-colors">
                    <span className="text-[13px] text-zinc-300">{b.label}</span>
                    <span className="text-[13px] tabular-nums text-zinc-100 text-right font-semibold">{b.orders}</span>
                    <span className="text-[13px] tabular-nums text-emerald-400 text-right font-semibold">{b.newCustomers}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary KPIs */}
            <div className="mt-4 bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Quick Stats</div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-zinc-400">Customers with orders</span>
                <span className="text-[13px] font-semibold text-zinc-100 tabular-nums">{repeatCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-zinc-400">Retention rate</span>
                <span className="text-[13px] font-semibold text-zinc-100 tabular-nums">
                  {totalCustomers > 0 ? ((trueRepeatCount / totalCustomers) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-zinc-400">With loyalty cards</span>
                <span className="text-[13px] font-semibold text-zinc-100 tabular-nums">
                  {topCustomers.filter(c => c.loyaltyCard != null).length}
                </span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
