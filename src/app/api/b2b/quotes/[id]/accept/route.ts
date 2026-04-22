import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const quote = await prisma.b2BPortalQuote.findUnique({
      where: { id },
      include: { lines: true },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (quote.status === 'accepted') {
      return NextResponse.json({ error: 'Quote already accepted' }, { status: 409 })
    }

    const [updatedQuote, order] = await prisma.$transaction([
      prisma.b2BPortalQuote.update({
        where: { id },
        data: { status: 'accepted' },
      }),
      prisma.b2BOrder.create({
        data: {
          accountId: quote.accountId,
          status: 'pending',
          subtotal: quote.subtotal,
          discountAmt: quote.discountAmt,
          taxAmt: 0,
          totalAmt: quote.totalAmt,
          notes: `Created from quote ${quote.quoteNumber}`,
          lines: {
            create: quote.lines.map((l) => ({
              productId: l.productId || null,
              productName: l.productName || null,
              sku: l.sku || null,
              qty: l.qty,
              unitPrice: l.unitPrice,
              discountPct: l.discountPct,
              lineTotal: l.lineTotal,
            })),
          },
        },
        include: { lines: true },
      }),
    ])

    return NextResponse.json({ quote: updatedQuote, order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to accept quote' }, { status: 500 })
  }
}
