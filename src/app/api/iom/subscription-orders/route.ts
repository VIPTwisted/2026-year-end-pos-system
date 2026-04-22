import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const orders = await prisma.subscriptionOrder.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (err) {
    console.error('GET /api/iom/subscription-orders', err)
    return NextResponse.json({ error: 'Failed to fetch subscription orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderNo, customerId, itemId, itemName, frequency, nextOrderDate, qty, unitPrice, notes } = body

    const order = await prisma.subscriptionOrder.create({
      data: {
        orderNo,
        customerId: customerId || null,
        itemId: itemId || null,
        itemName: itemName || null,
        frequency: frequency ?? 'monthly',
        nextOrderDate: nextOrderDate ? new Date(nextOrderDate) : null,
        qty: parseFloat(qty) || 1,
        unitPrice: parseFloat(unitPrice) || 0,
        notes: notes || null,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error('POST /api/iom/subscription-orders', err)
    return NextResponse.json({ error: 'Failed to create subscription order' }, { status: 500 })
  }
}
