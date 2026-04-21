import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  TrendingUp, DollarSign, Landmark, ArrowDownCircle,
  ArrowUpCircle, Users, ShoppingCart, Package,
  AlertTriangle, CheckCircle, Truck, Building2,
} from 'lucide-react'

export default async function Dashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    revenueAccounts,
    expenseAccounts,
    todaysOrders,
    activeCustomers,
    openAPData,
    openARData,
    bankBalance,
    activeEmployees,
    lowStockCount,
    openPOs,
    activeAssets,
    openFiscalPeriods,
    taxCodeCount,
    todaysOrderList,
  ] = await Promise.all([
    prisma.account.findMany({ where: { type: 'revenue', isActive: true }, select: { balance: true } }),
    prisma.account.findMany({ where: { type: 'expense', isActive: true }, select: { balance: true } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.vendorInvoice.aggregate({
      where: { status: { notIn: ['paid', 'cancelled'] } },
      _sum: { totalAmount: true, paidAmount: true },
      _count: { id: true },
    }),
    prisma.customerInvoice.aggregate({
      where: { status: { notIn: ['paid', 'cancelled'] } },
      _sum: { totalAmount: true, paidAmount: true },
      _count: { id: true },
    }),
    prisma.bankAccount.aggregate({
      where: { isActive: true },
      _sum: { currentBalance: true },
    }),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.inventory.count({
      where: {
        product: { reorderPoint: { not: null } },
        quantity: { lte: 5 },
      },
    }),
    prisma.purchaseOrder.count({ where: { status: { notIn: ['received', 'cancelled'] } } }),
    prisma.fixedAsset.count({ where: { status: 'active' } }),
    prisma.fiscalPeriod.count({ where: { status: 'open' } }),
    prisma.taxCode.count({ where: { isActive: true } }),
    prisma.order.findMany({
      where: { createdAt: { gte: today } },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const totalRevenue  = revenueAccounts.reduce((s, a) => s + a.balance, 0)
  const totalExpenses = expenseAccounts.reduce((s, a) => s + a.balance, 0)
  const netIncome     = totalRevenue - totalExpenses

  const openAP = Math.max(
    0,
    Number(openAPData._sum.totalAmount ?? 0) - Number(openAPData._sum.paidAmount ?? 0)
  )
  const openAR = Math.max(
    0,
    Number(openARData._sum.totalAmount ?? 0) - Number(openARData._sum.paidAmount ?? 0)
  )
  const bankTotal = Number(bankBalance._sum.currentBalance ?? 0)
  const todayRevenue = Number(todaysOrders._sum.totalAmount ?? 0)

  const netIncomePositive = netIncome >= 0
  const revenueBarPct = totalRevenue > 0 ? Math.min(100, Math.round((totalRevenue / (totalRevenue + totalExpenses)) * 100)) : 0
  const expenseBarPct = 100 - revenueBarPct

  const orderStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':     return 'success'
      case 'pending':  return 'warning'
      case 'refunded': return 'destructive'
      default:         return 'secondary'
    }
  }

  const KPI_CARDS = [
    {
      label: 'Net Income',
      value: formatCurrency(netIncome),
      sub: `${formatCurrency(totalRevenue)} rev`,
      icon: TrendingUp,
      color: netIncomePositive ? 'text-emerald-400' : 'text-red-400',
      gradient: netIncomePositive
        ? 'from-emerald-950/40 to-zinc-900'
        : 'from-red-950/40 to-zinc-900',
      iconColor: netIncomePositive ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      sub: `${todaysOrders._count.id} transactions`,
      icon: DollarSign,
      color: 'text-blue-400',
      gradient: 'from-blue-950/40 to-zinc-900',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Bank Balance',
      value: formatCurrency(bankTotal),
      sub: 'All accounts',
      icon: Landmark,
      color: 'text-cyan-400',
      gradient: 'from-cyan-950/30 to-zinc-900',
      iconColor: 'text-cyan-400',
    },
    {
      label: 'Open AR',
      value: formatCurrency(openAR),
      sub: `${openARData._count.id} invoices`,
      icon: ArrowDownCircle,
      color: 'text-violet-400',
      gradient: 'from-violet-950/30 to-zinc-900',
      iconColor: 'text-violet-400',
    },
    {
      label: 'Open AP',
      value: formatCurrency(openAP),
      sub: `${openAPData._count.id} invoices`,
      icon: ArrowUpCircle,
      color: 'text-amber-400',
      gradient: 'from-amber-950/30 to-zinc-900',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Employees',
      value: String(activeEmployees),
      sub: 'Active headcount',
      icon: Users,
      color: 'text-zinc-100',
      gradient: 'from-zinc-800/60 to-zinc-900',
      iconColor: 'text-zinc-400',
    },
  ]

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-5 overflow-auto">

        {/* Top KPI Row — 6 cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {KPI_CARDS.map(({ label, value, sub, icon: Icon, color, gradient, iconColor }) => (
            <Card key={label} className={`bg-gradient-to-br ${gradient} border-zinc-800`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider leading-tight">{label}</span>
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
                </div>
                <div className={`text-lg font-bold leading-tight ${color}`}>{value}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Middle Section: Today's Activity + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Today's Activity (2/3 width) */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-zinc-400" />
                Today's Activity
                <span className="ml-auto text-xs text-zinc-500 font-normal">{todaysOrderList.length} orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {todaysOrderList.length === 0 ? (
                <div className="px-5 pb-5 text-sm text-zinc-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-zinc-600" />
                  No transactions today yet.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Order #</th>
                      <th className="text-left px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Customer</th>
                      <th className="text-right px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Amount</th>
                      <th className="text-left px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Method</th>
                      <th className="text-right px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Time</th>
                      <th className="text-right px-5 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysOrderList.map((order) => (
                      <tr key={order.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-2.5 font-mono text-xs text-zinc-300">{order.orderNumber}</td>
                        <td className="px-3 py-2.5 text-zinc-300 truncate max-w-[110px]">
                          {order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : <span className="text-zinc-600">Guest</span>
                          }
                        </td>
                        <td className="px-3 py-2.5 text-right text-emerald-400 font-semibold text-xs">
                          {formatCurrency(Number(order.totalAmount))}
                        </td>
                        <td className="px-3 py-2.5 text-zinc-500 text-xs capitalize">
                          {order.paymentMethod ?? '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right text-zinc-600 font-mono text-xs">
                          {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <Badge variant={orderStatusVariant(order.status)} className="capitalize text-xs">
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats (1/3 width) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {[
                { label: 'Active Customers',  value: activeCustomers,     icon: Users,          href: '/customers', color: 'text-violet-400' },
                { label: 'Low Stock Items',   value: lowStockCount,       icon: AlertTriangle,  href: '/inventory', color: lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400' },
                { label: 'Open POs',          value: openPOs,             icon: Truck,          href: '/purchasing', color: 'text-blue-400' },
                { label: 'Active Assets',     value: activeAssets,        icon: Building2,      href: '/finance', color: 'text-cyan-400' },
                { label: 'Open Periods',      value: openFiscalPeriods,   icon: Package,        href: '/fiscal', color: 'text-zinc-300' },
                { label: 'Tax Codes',         value: taxCodeCount,        icon: DollarSign,     href: '/finance', color: 'text-zinc-400' },
              ].map(({ label, value, icon: Icon, href, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
                  </div>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: P&L Snapshot + AP/AR Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* P&L Snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                P&L Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Revenue bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-400">Total Revenue</span>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${revenueBarPct}%` }}
                  />
                </div>
              </div>

              {/* Expenses bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-400">Total Expenses</span>
                  <span className="text-sm font-bold text-red-400">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${expenseBarPct}%` }}
                  />
                </div>
              </div>

              {/* Divider + Net */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Net Income</span>
                  <span className={`text-base font-bold ${netIncomePositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {netIncomePositive ? '+' : ''}{formatCurrency(netIncome)}
                  </span>
                </div>
                {totalRevenue > 0 && (
                  <div className="text-xs text-zinc-600 mt-1">
                    Margin: {((netIncome / totalRevenue) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AP/AR Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-zinc-400" />
                AP / AR Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Open AR */}
              <div className="bg-violet-950/20 border border-violet-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-medium text-zinc-300">Open Receivables</span>
                  </div>
                  <Link href="/ar" className="text-xs text-violet-400 hover:underline">View AR</Link>
                </div>
                <div className="text-2xl font-bold text-violet-400">{formatCurrency(openAR)}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {openARData._count.id} invoice{openARData._count.id !== 1 ? 's' : ''} outstanding
                </div>
                <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: openAR > 0 ? `${Math.min(100, (openAR / (openAR + openAP + 1)) * 100)}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Open AP */}
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-zinc-300">Open Payables</span>
                  </div>
                  <Link href="/vendors" className="text-xs text-amber-400 hover:underline">View AP</Link>
                </div>
                <div className="text-2xl font-bold text-amber-400">{formatCurrency(openAP)}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {openAPData._count.id} invoice{openAPData._count.id !== 1 ? 's' : ''} outstanding
                </div>
                <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: openAP > 0 ? `${Math.min(100, (openAP / (openAR + openAP + 1)) * 100)}%` : '0%' }}
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </main>
    </>
  )
}
