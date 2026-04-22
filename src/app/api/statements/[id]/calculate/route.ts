import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const stmt = await prisma.commerceStatement.findUnique({ where: { id } })
  if (!stmt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (stmt.status === 'posted') return NextResponse.json({ error: 'Already posted' }, { status: 400 })

  const whereClause: Record<string, unknown> = {
    createdAt: { gte: stmt.startDate, lte: stmt.endDate },
    status: 'completed',
  }
  if (stmt.storeId) whereClause.storeId = stmt.storeId

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: { payments: true },
  })

  let totalSales = 0
  let totalReturns = 0
  let totalDiscounts = 0
  let totalTax = 0
  let totalCash = 0
  let totalCard = 0
  let totalGiftCard = 0

  for (const order of orders) {
    if (order.totalAmount < 0) {
      totalReturns += Math.abs(order.totalAmount)
    } else {
      totalSales += order.totalAmount
    }
    totalDiscounts += order.discountAmount
    totalTax += order.taxAmount

    for (const payment of order.payments) {
      const method = payment.method.toLowerCase()
      if (method === 'cash') totalCash += payment.amount
      else if (method === 'gift_card' || method === 'giftcard') totalGiftCard += payment.amount
      else totalCard += payment.amount
    }
  }

  const variance = totalCash - (totalSales - totalCard - totalGiftCard)

  const updated = await prisma.commerceStatement.update({
    where: { id },
    data: {
      totalSales,
      totalReturns,
      totalDiscounts,
      totalTax,
      totalCash,
      totalCard,
      totalGiftCard,
      transactionCount: orders.length,
      variance,
      status: 'calculated',
      calculatedAt: new Date(),
    },
  })

  return NextResponse.json(updated)
}
