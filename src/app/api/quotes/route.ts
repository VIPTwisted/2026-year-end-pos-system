import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateQuoteNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `Q-${year}-${rand}`
}

function calcTotals(lines: { quantity: number; unitPrice: number; discountPct: number }[]) {
  const subtotal = lines.reduce((sum, l) => {
    const lineTotal = l.quantity * l.unitPrice * (1 - l.discountPct / 100)
    return sum + lineTotal
  }, 0)
  const discountAmount = lines.reduce((sum, l) => {
    return sum + l.quantity * l.unitPrice * (l.discountPct / 100)
  }, 0)
  const taxAmount = subtotal * 0.1
  const total = subtotal + taxAmount
  return { subtotal, discountAmount, taxAmount, total }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (customerId) where.customerId = customerId

  const quotes = await prisma.salesQuote.findMany({
    where,
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      store: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(quotes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, storeId, validUntil, notes, terms, lines = [] } = body

  if (!customerId || !storeId) {
    return NextResponse.json({ error: 'customerId and storeId are required' }, { status: 400 })
  }

  // Ensure unique quote number
  let quoteNumber = generateQuoteNumber()
  let exists = await prisma.salesQuote.findUnique({ where: { quoteNumber } })
  while (exists) {
    quoteNumber = generateQuoteNumber()
    exists = await prisma.salesQuote.findUnique({ where: { quoteNumber } })
  }

  const { subtotal, discountAmount, taxAmount, total } = calcTotals(lines)

  const quote = await prisma.salesQuote.create({
    data: {
      quoteNumber,
      customerId,
      storeId,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes,
      terms,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      lines: {
        create: lines.map((l: { productId: string; quantity: number; unitPrice: number; discountPct?: number; description?: string }) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountPct: l.discountPct ?? 0,
          lineTotal: l.quantity * l.unitPrice * (1 - (l.discountPct ?? 0) / 100),
          description: l.description,
        })),
      },
    },
    include: { lines: true, customer: true, store: true },
  })

  return NextResponse.json(quote, { status: 201 })
}
