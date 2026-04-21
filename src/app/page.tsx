import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  HeadphonesIcon,
  Megaphone,
  Wrench,
  Warehouse,
  Truck,
  UserCheck,
  Building2,
} from 'lucide-react'

export default async function Dashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    todaysOrders,
    totalCustomers,
    productCount,
    openOrders,
    lowStockCount,
    openCases,
    activeCampaigns,
    openWorkOrders,
    recentOrders,
    lowStockItems,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.serviceCase.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    prisma.campaign.count({ where: { status: 'active' } }),
    prisma.workOrder.count({ where: { status: { in: ['new', 'assigned', 'in_progress'] } } }),
    prisma.order.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.inventory.findMany({
      where: { quantity: { lte: 5 } },
      include: { product: true },
      orderBy: { quantity: 'asc' },
      take: 5,
    }),
  ])

  const statusVariant = (status: string) => {
    switch (status) {
      case 'paid':      return 'success'
      case 'pending':   return 'warning'
      case 'refunded':  return 'destructive'
      case 'voided':    return 'secondary'
      default:          return 'secondary'
    }
  }

  const MODULES = [
    { name: 'POS Terminal',     desc: 'Sales, checkout, receipts',       href: '/pos',           color: 'bg-blue-600',    Icon: ShoppingCart  },
    { name: 'Inventory',        desc: 'Stock levels, adjustments',        href: '/inventory',     color: 'bg-emerald-600', Icon: Package       },
    { name: 'Customers / CRM',  desc: 'Customer database, history',       href: '/customers',     color: 'bg-violet-600',  Icon: Users         },
    { name: 'Purchasing',       desc: 'Purchase orders, suppliers',       href: '/purchasing',    color: 'bg-amber-600',   Icon: Truck         },
    { name: 'Customer Service', desc: 'Cases, tickets, SLA',              href: '/service',       color: 'bg-rose-600',    Icon: HeadphonesIcon},
    { name: 'Finance',          desc: 'GL, AP/AR, journal entries',       href: '/finance',       color: 'bg-cyan-600',    Icon: DollarSign    },
    { name: 'Marketing',        desc: 'Campaigns, email, segmentation',   href: '/marketing',     color: 'bg-pink-600',    Icon: Megaphone     },
    { name: 'Field Service',    desc: 'Work orders, scheduling',          href: '/field-service', color: 'bg-orange-600',  Icon: Wrench        },
    { name: 'HR & Shifts',      desc: 'Employees, scheduling',            href: '/hr',            color: 'bg-teal-600',    Icon: UserCheck     },
    { name: 'Stores / HQ',      desc: 'Multi-store management',           href: '/stores',        color: 'bg-indigo-600',  Icon: Building2     },
    { name: 'Warehouse',        desc: 'Receiving, putaway, fulfillment',  href: '/warehouse',     color: 'bg-lime-600',    Icon: Warehouse     },
  ]

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6 overflow-auto">

        {/* Row 1 — 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Today's Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(Number(todaysOrders._sum.totalAmount ?? 0))}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{todaysOrders._count.id} transactions</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Open Orders</span>
                <ShoppingCart className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-100">{openOrders}</div>
              <div className="text-xs text-zinc-500 mt-1">Pending processing</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Active Customers</span>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-100">{totalCustomers}</div>
              <div className="text-xs text-zinc-500 mt-1">In database</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Products</span>
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-100">{productCount}</div>
              <div className="text-xs text-zinc-500 mt-1">In catalog</div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2 — 3 Operational Stat Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Service Cases</span>
                <HeadphonesIcon className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400">{openCases}</div>
              <div className="text-xs text-zinc-500 mt-1">Open / In progress</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Active Campaigns</span>
                <Megaphone className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-2xl font-bold text-pink-400">{activeCampaigns}</div>
              <div className="text-xs text-zinc-500 mt-1">Running now</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Work Orders</span>
                <Wrench className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400">{openWorkOrders}</div>
              <div className="text-xs text-zinc-500 mt-1">New / Assigned / Active</div>
            </CardContent>
          </Card>
        </div>

        {/* Row 3 — Recent Orders + Low Stock Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="px-5 pb-5 text-sm text-zinc-500">No orders yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Order #</th>
                      <th className="text-left px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Customer</th>
                      <th className="text-right px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Total</th>
                      <th className="text-right px-5 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-zinc-300">{order.orderNumber}</td>
                        <td className="px-3 py-3 text-zinc-300 truncate max-w-[120px]">
                          {order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : <span className="text-zinc-600">Guest</span>
                          }
                        </td>
                        <td className="px-3 py-3 text-right text-emerald-400 font-semibold">
                          {formatCurrency(Number(order.totalAmount))}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Badge variant={statusVariant(order.status)} className="capitalize">
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

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockCount === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  All stock levels healthy
                </div>
              ) : (
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                      <div className="min-w-0">
                        <div className="text-sm text-zinc-200 truncate">{item.product.name}</div>
                        <div className="text-xs text-zinc-500 font-mono">{item.product.sku}</div>
                      </div>
                      <div className={`text-sm font-bold ml-4 shrink-0 ${item.quantity <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
                        {item.quantity} left
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 4 — Module Grid */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Platform Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MODULES.map(({ name, desc, href, color, Icon }) => (
              <Link key={name} href={href} className="group block">
                <Card className="hover:border-zinc-600 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className={`w-8 h-8 ${color} rounded-lg mb-3 flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-zinc-100 group-hover:text-white mb-1">{name}</div>
                    <div className="text-xs text-zinc-500">{desc}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
