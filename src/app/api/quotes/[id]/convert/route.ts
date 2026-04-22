import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const quote = await prisma.salesQuote.findUnique({
    where: { id },
    include: {
      lines: { include: { product: true } },
      customer: true,
    },
  })

  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (quote.status !== 'accepted') {
    return NextResponse.json({ error: 'Only accepted quotes can be converted to orders' }, { status: 400 })
  }
  if (quote.convertedOrderId) {
    return NextResponse.json({ error: 'Quote already converted', orderId: quote.convertedOrderId }, { status: 400 })
  }

  let orderNumber = generateOrderNumber()
  let exists = await prisma.order.findUnique({ where: { orderNumber } })
  while (exists) {
    orderNumber = generateOrderNumber()
    exists = await prisma.order.findUnique({ where: { orderNumber } })
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      storeId: quote.storeId,
      customerId: quote.customerId,
      status: 'pending',
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      discountAmount: quote.discountAmount,
      totalAmount: quote.total,
      notes: `Converted from quote ${quote.quoteNumber}`,
      items: {
        create: quote.lines
          .filter(l => l.product !== null && l.productId !== null)
          .map(l => ({
            productId: l.productId!,
            productName: l.product!.name,
            sku: l.product!.sku,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discount: l.discountPct,
            taxAmount: l.lineTotal * 0.1,
            lineTotal: l.lineTotal,
          })),
      },
    },
    include: { items: true },
  })

  await prisma.salesQuote.update({
    where: { id },
    data: { status: 'converted', convertedOrderId: order.id },
  })

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 })
}
