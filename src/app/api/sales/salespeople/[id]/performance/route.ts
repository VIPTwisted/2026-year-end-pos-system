import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const salesperson = await prisma.salesperson.findUnique({
      where: { id },
      select: { id: true, customers: { select: { id: true } } },
    })
    if (!salesperson) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const customerIds = salesperson.customers.map(c => c.id)

    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const endOfYear = new Date(currentYear + 1, 0, 1)

    // Fetch all orders for this year where customer belongs to salesperson
    const orders = customerIds.length > 0
      ? await prisma.order.findMany({
          where: {
            customerId: { in: customerIds },
            createdAt: { gte: startOfYear, lt: endOfYear },
            status: { notIn: ['cancelled', 'void'] },
          },
          select: {
            totalAmount: true,
            createdAt: true,
          },
        })
      : []

    // Group by month (1-12)
    const monthly: Record<number, number> = {}
    for (let m = 1; m <= 12; m++) monthly[m] = 0

    for (const order of orders) {
      const month = new Date(order.createdAt).getMonth() + 1
      monthly[month] = (monthly[month] ?? 0) + order.totalAmount
    }

    const monthlyData = Object.entries(monthly).map(([month, total]) => ({
      month: parseInt(month),
      total,
    }))

    const ytdTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0)

    return NextResponse.json({ monthlyData, ytdTotal, year: currentYear })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
