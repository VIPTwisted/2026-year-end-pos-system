import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

type LayawayItem = {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  taxAmount: number
  lineTotal: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerId?: string
      items?: LayawayItem[]
      totalAmount?: number
      depositAmount?: number
      notes?: string
    }
    const { customerId, items, totalAmount, depositAmount, notes } = body
    if (!customerId) return NextResponse.json({ error: 'Customer required for layaway' }, { status: 400 })
    if (!items?.length) return NextResponse.json({ error: 'No items provided' }, { status: 400 })

    const store = await prisma.store.findFirst()
    if (!store) return NextResponse.json({ error: 'No store configured' }, { status: 400 })

    const deposit = depositAmount ?? 0
    const total = totalAmount ?? 0

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        storeId: store.id,
        customerId,
        status: 'layaway',
        subtotal: total,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: total,
        paymentMethod: 'layaway',
        amountTendered: deposit,
        changeDue: 0,
        notes: `LAYAWAY. Deposit: $${deposit.toFixed(2)}. ${notes ?? ''}`.trim(),
        items: {
          create: items.map(i => ({
            productId: i.productId,
            productName: i.productName,
            sku: i.sku,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxAmount: i.taxAmount,
            lineTotal: i.lineTotal,
          })),
        },
        payments: deposit > 0
          ? {
              create: [{ method: 'cash', amount: deposit, status: 'deposit' }],
            }
          : undefined,
      },
      include: { items: true },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get('customerId')
    const orders = await prisma.order.findMany({
      where: {
        status: 'layaway',
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(orders)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
