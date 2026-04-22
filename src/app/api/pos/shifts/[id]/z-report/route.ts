import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const shift = await prisma.posShift.findUnique({
      where: { id },
      include: {
        store: { select: { name: true, address: true, city: true, state: true } },
        orders: {
          include: { payments: true, items: true },
        },
      },
    })
    if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })

    const orders = shift.orders.filter(o => o.status !== 'voided')
    const voidedOrders = shift.orders.filter(o => o.status === 'voided')
    const returnOrders = orders.filter(o => o.totalAmount < 0)
    const saleOrders = orders.filter(o => o.totalAmount >= 0)

    const paymentBreakdown: Record<string, { count: number; amount: number }> = {}
    for (const order of orders) {
      for (const p of order.payments) {
        if (!paymentBreakdown[p.method]) paymentBreakdown[p.method] = { count: 0, amount: 0 }
        paymentBreakdown[p.method].count += 1
        paymentBreakdown[p.method].amount += p.amount
      }
    }

    const totalSales = saleOrders.reduce((s, o) => s + o.totalAmount, 0)
    const totalReturns = Math.abs(returnOrders.reduce((s, o) => s + o.totalAmount, 0))
    const taxCollected = orders.reduce((s, o) => s + o.taxAmount, 0)
    const discountTotal = orders.reduce((s, o) => s + o.discountAmount, 0)
    const netSales = totalSales - totalReturns

    return NextResponse.json({
      shift: {
        id: shift.id,
        cashierName: shift.cashierName,
        registerId: shift.registerId,
        openTime: shift.openTime,
        closeTime: shift.closeTime,
        status: shift.status,
        openFloat: shift.openFloat,
        closeFloat: shift.closeFloat,
        store: shift.store,
      },
      summary: {
        transactionCount: saleOrders.length,
        returnCount: returnOrders.length,
        voidCount: voidedOrders.length,
        totalSales,
        totalReturns,
        netSales,
        taxCollected,
        discountTotal,
        expectedCash: shift.openFloat + (paymentBreakdown['cash']?.amount ?? 0),
        actualCash: shift.closeFloat ?? null,
        variance: shift.closeFloat != null
          ? shift.closeFloat - (shift.openFloat + (paymentBreakdown['cash']?.amount ?? 0))
          : null,
      },
      paymentBreakdown,
      topItems: Object.entries(
        orders.flatMap(o => o.items).reduce<Record<string, { name: string; qty: number; total: number }>>((acc, item) => {
          if (!acc[item.productId]) acc[item.productId] = { name: item.productName, qty: 0, total: 0 }
          acc[item.productId].qty += item.quantity
          acc[item.productId].total += item.lineTotal
          return acc
        }, {})
      ).sort((a, b) => b[1].total - a[1].total).slice(0, 10).map(([productId, v]) => ({ productId, ...v })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
