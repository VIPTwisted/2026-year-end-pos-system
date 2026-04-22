import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerId: string
      items: Array<{
        productId: string
        productName: string
        sku: string
        quantity: number
        unitPrice: number
        taxAmount: number
        lineTotal: number
      }>
      subtotal?: number
      taxAmount?: number
      totalAmount: number
      shippingAddress: {
        line1: string
        line2?: string
        city: string
        state: string
        zip: string
      }
      shippingMethod?: string
      depositAmount?: number
      notes?: string
    }

    const {
      customerId,
      items,
      subtotal,
      taxAmount,
      totalAmount,
      shippingAddress,
      shippingMethod,
      depositAmount,
      notes,
    } = body

    if (!customerId) {
      return NextResponse.json({ error: 'Customer required for customer order' }, { status: 400 })
    }
    if (!items?.length) {
      return NextResponse.json({ error: 'No items' }, { status: 400 })
    }
    if (!shippingAddress?.line1 || !shippingAddress?.city) {
      return NextResponse.json({ error: 'Shipping address required' }, { status: 400 })
    }

    const store = await prisma.store.findFirst()
    if (!store) {
      return NextResponse.json({ error: 'No store' }, { status: 400 })
    }

    const deposit = depositAmount ?? 0

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        storeId: store.id,
        customerId,
        status: 'customer_order',
        subtotal: subtotal ?? totalAmount,
        taxAmount: taxAmount ?? 0,
        discountAmount: 0,
        totalAmount,
        paymentMethod: deposit > 0 ? 'deposit' : 'unpaid',
        amountTendered: deposit,
        changeDue: 0,
        notes: [
          'CUSTOMER ORDER',
          `Ship to: ${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`,
          shippingMethod ? `Method: ${shippingMethod}` : null,
          notes ?? null,
        ]
          .filter((v): v is string => v !== null)
          .join('\n'),
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
        ...(deposit > 0
          ? {
              payments: {
                create: [{ method: 'cash', amount: deposit, status: 'deposit' }],
              },
            }
          : {}),
      },
      include: {
        items: true,
        customer: { select: { firstName: true, lastName: true } },
      },
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
        status: 'customer_order',
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        items: { take: 3 },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(orders)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
