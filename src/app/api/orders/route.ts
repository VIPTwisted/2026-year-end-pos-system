import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const store = await prisma.store.findFirst()
  if (!store) return NextResponse.json({ error: 'No store configured' }, { status: 400 })

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      storeId: store.id,
      status: 'paid',
      subtotal: body.subtotal,
      taxAmount: body.taxAmount,
      discountAmount: body.discountAmount ?? 0,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      amountTendered: body.amountTendered,
      changeDue: body.changeDue,
      items: {
        create: body.items.map((item: { productId: string; productName: string; sku: string; quantity: number; unitPrice: number; taxAmount: number; lineTotal: number }) => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxAmount: item.taxAmount,
          lineTotal: item.lineTotal,
        })),
      },
      payments: {
        create: [{
          method: body.paymentMethod,
          amount: body.totalAmount,
          status: 'completed',
        }],
      },
    },
    include: { items: true },
  })
  return NextResponse.json(order, { status: 201 })
}
