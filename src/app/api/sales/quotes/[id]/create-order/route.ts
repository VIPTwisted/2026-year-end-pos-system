import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const quote = await prisma.salesQuote.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

    const order = await prisma.salesOrder.create({
      data: {
        accountName: quote.accountName,
        quoteId: quote.id,
        totalAmount: quote.totalAmount,
        ownerId: quote.ownerId,
        status: 'new',
        items: {
          create: quote.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true },
    })

    await prisma.salesQuote.update({ where: { id }, data: { status: 'won' } })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order from quote' }, { status: 500 })
  }
}
