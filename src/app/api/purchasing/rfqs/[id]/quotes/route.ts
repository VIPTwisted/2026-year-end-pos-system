import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quotes = await prisma.vendorQuote.findMany({
    where: { rfqId: id },
    include: {
      vendor: true,
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
    orderBy: { totalAmount: 'asc' },
  })
  return NextResponse.json(quotes)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { vendorId, validUntil, leadTimeDays, notes, lines } = body

  if (!vendorId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: 'At least one quote line required' }, { status: 400 })
  }

  let total = 0
  const processedLines = (lines as Array<{ productId: string; quantity: number; unitPrice: number; leadTimeDays?: number }>).map(l => {
    const qty = Number(l.quantity) || 0
    const price = Number(l.unitPrice) || 0
    const lineTotal = qty * price
    total += lineTotal
    return {
      productId: l.productId,
      quantity: qty,
      unitPrice: price,
      lineTotal,
      leadTimeDays: l.leadTimeDays ? Number(l.leadTimeDays) : null,
    }
  })

  const quote = await prisma.vendorQuote.create({
    data: {
      rfqId: id,
      vendorId,
      totalAmount: total,
      validUntil: validUntil ? new Date(validUntil) : null,
      leadTimeDays: leadTimeDays ? Number(leadTimeDays) : null,
      notes: notes || null,
      lines: { create: processedLines },
    },
    include: {
      vendor: true,
      lines: { include: { product: true } },
    },
  })

  // Update RFQ status to quoted
  await prisma.purchaseRFQ.update({
    where: { id },
    data: { status: 'quoted' },
  })

  return NextResponse.json(quote, { status: 201 })
}
