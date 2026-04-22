import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const totalCustomers = await prisma.customer.count({ where: { isActive: true } })

  const newCustomers = await prisma.customer.count({
    where: { createdAt: { gte: fromDate, lte: toDate } },
  })

  const topSpenders = await prisma.customer.findMany({
    where: { totalSpent: { gt: 0 } },
    orderBy: { totalSpent: 'desc' },
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      totalSpent: true,
      visitCount: true,
      createdAt: true,
    },
  })

  const ordersInPeriod = await prisma.order.findMany({
    where: {
      createdAt: { gte: fromDate, lte: toDate },
      status: 'completed',
      customerId: { not: null },
    },
    select: { customerId: true },
  })

  const uniqueCustomersInPeriod = new Set(ordersInPeriod.map(o => o.customerId)).size

  const newCustIds = await prisma.customer.findMany({
    where: { createdAt: { gte: fromDate, lte: toDate } },
    select: { id: true },
  })
  const newCustIdSet = new Set(newCustIds.map(c => c.id))
  const returningInPeriod = [...new Set(ordersInPeriod.map(o => o.customerId))].filter(
    cid => cid && !newCustIdSet.has(cid)
  ).length

  return NextResponse.json({
    totalCustomers,
    newCustomers,
    returningCustomers: totalCustomers - newCustomers,
    activeInPeriod: uniqueCustomersInPeriod,
    newInPeriod: newCustIds.length,
    returningInPeriod,
    topSpenders,
  })
}
