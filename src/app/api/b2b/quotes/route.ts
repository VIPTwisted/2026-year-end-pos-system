import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genQuoteNumber() {
  return 'QT-' + Math.floor(100000 + Math.random() * 900000)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const orgId = searchParams.get('orgId') || ''

    const quotes = await prisma.b2BQuote.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(orgId ? { orgId } : {}),
      },
      include: {
        org: { select: { id: true, name: true, accountNumber: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(quotes)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orgId, contactName, validUntil, notes, lines } = body

    if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 })

    let quoteNumber = genQuoteNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.b2BQuote.findUnique({ where: { quoteNumber } })
      if (!existing) break
      quoteNumber = genQuoteNumber()
      attempts++
    }

    const parsedLines: Array<{ productName: string; sku?: string; qty: number; listPrice: number; quotedPrice: number; notes?: string }> = lines ?? []
    const subtotal = parsedLines.reduce((s, l) => s + (l.quotedPrice ?? 0) * (l.qty ?? 1), 0)
    const discount = parsedLines.reduce((s, l) => s + ((l.listPrice ?? 0) - (l.quotedPrice ?? 0)) * (l.qty ?? 1), 0)
    const tax = 0
    const total = subtotal + tax

    const quote = await prisma.b2BQuote.create({
      data: {
        quoteNumber,
        orgId,
        contactName: contactName ?? null,
        validUntil: validUntil ? new Date(validUntil) : null,
        notes: notes ?? null,
        subtotal,
        discount,
        tax,
        total,
        status: 'draft',
        lines: {
          create: parsedLines.map((l) => ({
            productName: l.productName,
            sku: l.sku ?? null,
            qty: l.qty ?? 1,
            listPrice: l.listPrice ?? 0,
            quotedPrice: l.quotedPrice ?? 0,
            lineTotal: (l.quotedPrice ?? 0) * (l.qty ?? 1),
            notes: l.notes ?? null,
          })),
        },
      },
      include: { lines: true, org: true },
    })
    return NextResponse.json(quote, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
