import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const invoice = await prisma.salesInvoice.create({
      data: {
        accountName: order.accountName,
        orderId: order.id,
        totalAmount: order.totalAmount,
        status: 'draft',
        items: {
          create: order.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
