import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    const [
      revenueToday,
      revenueWeek,
      revenueMonth,
      revenueYear,
      ordersToday,
      ordersWeek,
      ordersMonth,
      totalCustomers,
      newCustomersThisMonth,
      topProductsRaw,
      recentOrders,
    ] = await Promise.all([
      /* revenue aggregates */
      prisma.order.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: weekStart } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: yearStart } },
        _sum: { totalAmount: true },
      }),

      /* order counts */
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.order.count({ where: { createdAt: { gte: monthStart } } }),

      /* customers */
      prisma.customer.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),

      /* top 5 products by revenue (all time) */
      prisma.orderItem.groupBy({
        by: ['productId', 'productName', 'sku'],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { lineTotal: 'desc' } },
        take: 5,
      }),

      /* recent 10 orders */
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          customer: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    const topProducts = topProductsRaw.map(p => ({
      productId: p.productId,
      productName: p.productName,
      sku: p.sku,
      unitsSold: p._sum.quantity ?? 0,
      revenue: p._sum.lineTotal ?? 0,
    }))

    const recentOrdersMapped = recentOrders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
      customerName: o.customer
        ? `${o.customer.firstName} ${o.customer.lastName}`
        : null,
      customerId: o.customer?.id ?? null,
    }))

    return NextResponse.json({
      revenue: {
        today: revenueToday._sum.totalAmount ?? 0,
        week: revenueWeek._sum.totalAmount ?? 0,
        month: revenueMonth._sum.totalAmount ?? 0,
        year: revenueYear._sum.totalAmount ?? 0,
      },
      orders: {
        today: ordersToday,
        week: ordersWeek,
        month: ordersMonth,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      topProducts,
      recentOrders: recentOrdersMapped,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
