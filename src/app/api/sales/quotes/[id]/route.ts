import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const quote = await prisma.salesQuote.findUnique({
      where: { id },
      include: { lines: true },
    })
    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(quote)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, lines, ...rest } = body

    // Handle actions
    if (action === 'send') rest.status = 'Sent'
    if (action === 'accept') rest.status = 'Accepted'
    if (action === 'reject') rest.status = 'Rejected'
    if (action === 'make_order') {
      // Convert quote to sales order
      const quote = await prisma.salesQuote.findUnique({
        where: { id },
        include: { lines: true },
      })
      if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const order = await prisma.salesOrder.create({
        data: {
          sellToCustomerId: quote.customerId,
          sellToCustomerName: quote.sellToCustomerName,
          externalDocNo: quote.externalDocNo ?? '',
          salespersonCode: quote.salespersonCode ?? '',
          status: 'Open',
          subtotal: quote.subtotal,
          discountAmount: quote.discountAmount,
          taxAmount: quote.taxAmount,
          totalAmount: quote.total,
          notes: quote.notes ?? '',
          items: {
            create: quote.lines.map(l => ({
              lineType: l.lineType,
              itemNo: l.itemNo ?? '',
              description: l.description ?? l.productName,
              productName: l.productName,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              pricePerUnit: l.unitPrice,
              discountPct: l.discountPct,
              lineTotal: l.lineTotal,
            })),
          },
        },
        include: { items: true },
      })

      await prisma.salesQuote.update({
        where: { id },
        data: { status: 'Accepted', convertedOrderId: order.id },
      })

      return NextResponse.json({ quote: { id, status: 'Accepted' }, order })
    }

    const quote = await prisma.salesQuote.update({
      where: { id },
      data: {
        ...rest,
        ...(lines !== undefined
          ? {
              lines: {
                deleteMany: {},
                create: lines.map((l: Record<string, unknown>) => ({
                  lineType: String(l.lineType ?? 'Item'),
                  itemNo: String(l.itemNo ?? ''),
                  productName: String(l.description ?? ''),
                  description: String(l.description ?? ''),
                  quantity: Number(l.quantity ?? 1),
                  unitPrice: Number(l.unitPrice ?? 0),
                  discountPct: Number(l.discountPct ?? 0),
                  lineTotal: Number(l.lineTotal ?? 0),
                })),
              },
            }
          : {}),
      },
      include: { lines: true },
    })
    return NextResponse.json(quote)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
