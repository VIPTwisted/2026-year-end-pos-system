import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const stores = await prisma.store.findMany({
    where: { isActive: true },
    select: { id: true, name: true, city: true, state: true },
  })

  const storeStats = await Promise.all(
    stores.map(async store => {
      const orders = await prisma.order.findMany({
        where: {
          storeId: store.id,
          createdAt: { gte: fromDate, lte: toDate },
          status: 'completed',
        },
        select: { totalAmount: true, discountAmount: true },
      })

      const revenue = orders.reduce((s, o) => s + o.totalAmount, 0)
      const transactions = orders.length
      const avgOrder = transactions > 0 ? revenue / transactions : 0
      const discounts = orders.reduce((s, o) => s + o.discountAmount, 0)

      return {
        storeId: store.id,
        storeName: store.name,
        city: store.city,
        state: store.state,
        revenue,
        transactions,
        avgOrder,
        discounts,
      }
    })
  )

  const sorted = storeStats.sort((a, b) => b.revenue - a.revenue)
  const totalRevenue = sorted.reduce((s, s2) => s + s2.revenue, 0)

  return NextResponse.json({
    stores: sorted.map(s => ({
      ...s,
      pctOfTotal: totalRevenue > 0 ? (s.revenue / totalRevenue) * 100 : 0,
    })),
    totalRevenue,
  })
}
