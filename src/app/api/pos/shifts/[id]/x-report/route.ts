import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const shift = await prisma.posShift.findUnique({
      where: { id },
      include: {
        store: { select: { name: true } },
        orders: {
          where: { status: { not: 'voided' } },
          include: { payments: true },
        },
      },
    })
    if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })

    const paymentBreakdown: Record<string, number> = {}
    let totalSales = 0
    let taxTotal = 0
    let discountTotal = 0

    for (const order of shift.orders) {
      totalSales += order.totalAmount
      taxTotal += order.taxAmount
      discountTotal += order.discountAmount
      for (const p of order.payments) {
        paymentBreakdown[p.method] = (paymentBreakdown[p.method] ?? 0) + p.amount
      }
    }

    return NextResponse.json({
      shiftId: id,
      cashierName: shift.cashierName,
      registerId: shift.registerId,
      openTime: shift.openTime,
      reportTime: new Date(),
      transactionCount: shift.orders.length,
      totalSales,
      taxTotal,
      discountTotal,
      paymentBreakdown,
      openFloat: shift.openFloat,
      expectedCash: shift.openFloat + (paymentBreakdown['cash'] ?? 0),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
