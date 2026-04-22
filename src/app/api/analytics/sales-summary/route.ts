import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: fromDate, lte: toDate },
      status: 'completed',
    },
    select: {
      id: true,
      totalAmount: true,
      createdAt: true,
      discountAmount: true,
      taxAmount: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const byDate = new Map<string, { date: string; sales: number; orders: number; discounts: number }>()
  for (const order of orders) {
    const date = order.createdAt.toISOString().split('T')[0]
    if (!byDate.has(date)) {
      byDate.set(date, { date, sales: 0, orders: 0, discounts: 0 })
    }
    const day = byDate.get(date)!
    day.sales += order.totalAmount
    day.orders += 1
    day.discounts += order.discountAmount
  }

  const daily = Array.from(byDate.values())
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0)
  const totalTransactions = orders.length
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
  const totalDiscounts = orders.reduce((s, o) => s + o.discountAmount, 0)

  return NextResponse.json({
    totalRevenue,
    totalTransactions,
    avgOrderValue,
    totalDiscounts,
    daily,
  })
}
