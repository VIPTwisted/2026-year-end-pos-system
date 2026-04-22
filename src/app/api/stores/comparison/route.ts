import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Period = 'today' | 'week' | 'month' | 'year'

function getPeriodStart(period: Period): Date {
  const now = new Date()
  switch (period) {
    case 'today': {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - 6)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'month': {
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    }
    case 'year': {
      return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const rawPeriod = sp.get('period') ?? 'month'
    const period: Period = (['today', 'week', 'month', 'year'] as Period[]).includes(rawPeriod as Period)
      ? (rawPeriod as Period)
      : 'month'

    const periodStart = getPeriodStart(period)

    // Fetch all stores
    const stores = await prisma.store.findMany({ orderBy: { name: 'asc' } })

    // Aggregate orders in period, grouped by storeId
    const orderGroups = await prisma.order.groupBy({
      by: ['storeId'],
      where: { createdAt: { gte: periodStart } },
      _sum: { totalAmount: true },
      _count: { id: true },
    })
    const orderMap = new Map(
      orderGroups.map(g => [
        g.storeId,
        { revenue: g._sum.totalAmount ?? 0, orders: g._count.id },
      ])
    )

    // Inventory value + low stock per store
    const inventoryRows = await prisma.inventory.findMany({
      include: { product: { select: { costPrice: true, reorderPoint: true } } },
    })
    const invValueMap = new Map<string, number>()
    const lowStockMap = new Map<string, number>()
    for (const row of inventoryRows) {
      const val = row.quantity * (row.product.costPrice ?? 0)
      invValueMap.set(row.storeId, (invValueMap.get(row.storeId) ?? 0) + val)

      const rp = row.product.reorderPoint ?? 0
      if (rp > 0 && row.quantity <= rp) {
        lowStockMap.set(row.storeId, (lowStockMap.get(row.storeId) ?? 0) + 1)
      }
    }

    // Active PosShift per store
    const openShifts = await prisma.posShift.findMany({
      where: { status: 'open' },
      select: { storeId: true },
    })
    const openShiftSet = new Set(openShifts.map(s => s.storeId))

    // Employee count per store
    const empGroups = await prisma.employee.groupBy({
      by: ['storeId'],
      _count: { id: true },
    })
    const empMap = new Map(empGroups.map(g => [g.storeId, g._count.id]))

    // Build response
    const storeData = stores.map(store => {
      const ord = orderMap.get(store.id) ?? { revenue: 0, orders: 0 }
      const revenue = ord.revenue
      const orders = ord.orders
      const avgOrderValue = orders > 0 ? revenue / orders : 0

      return {
        id: store.id,
        name: store.name,
        address: [store.address, store.city, store.state, store.zip]
          .filter(Boolean)
          .join(', '),
        isActive: store.isActive,
        metrics: {
          revenue,
          orders,
          avgOrderValue,
          totalInventoryValue: invValueMap.get(store.id) ?? 0,
          lowStockCount: lowStockMap.get(store.id) ?? 0,
          activeShift: openShiftSet.has(store.id),
          employeeCount: empMap.get(store.id) ?? 0,
        },
      }
    })

    const totalRevenue = storeData.reduce((s, st) => s + st.metrics.revenue, 0)
    const totalOrders = storeData.reduce((s, st) => s + st.metrics.orders, 0)

    return NextResponse.json({
      stores: storeData,
      period,
      totals: { revenue: totalRevenue, orders: totalOrders },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
