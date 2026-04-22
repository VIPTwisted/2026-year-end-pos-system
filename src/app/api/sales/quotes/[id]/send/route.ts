import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const quote = await prisma.salesQuote.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    if (quote.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft quotes can be sent' }, { status: 400 })
    }

    const updated = await prisma.salesQuote.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
      select: { id: true, status: true, sentAt: true, quoteNumber: true },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
