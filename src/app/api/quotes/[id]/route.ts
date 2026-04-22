import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calcTotals(lines: { quantity: number; unitPrice: number; discountPct: number }[]) {
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (1 - l.discountPct / 100), 0)
  const discountAmount = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (l.discountPct / 100), 0)
  const taxAmount = subtotal * 0.1
  const total = subtotal + taxAmount
  return { subtotal, discountAmount, taxAmount, total }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quote = await prisma.salesQuote.findUnique({
    where: { id },
    include: {
      customer: true,
      store: { select: { id: true, name: true, address: true, city: true, state: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true, salePrice: true } } } },
    },
  })
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quote)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const existing = await prisma.salesQuote.findUnique({ where: { id }, include: { lines: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updateData: Record<string, unknown> = {}
  if (body.status !== undefined) updateData.status = body.status
  if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null
  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.terms !== undefined) updateData.terms = body.terms
  if (body.convertedOrderId !== undefined) updateData.convertedOrderId = body.convertedOrderId

  if (body.lines) {
    const { subtotal, discountAmount, taxAmount, total } = calcTotals(body.lines)
    Object.assign(updateData, { subtotal, discountAmount, taxAmount, total })
    await prisma.salesQuoteLine.deleteMany({ where: { quoteId: id } })
    await prisma.salesQuoteLine.createMany({
      data: body.lines.map((l: { productId: string; quantity: number; unitPrice: number; discountPct?: number; description?: string }) => ({
        quoteId: id,
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPct: l.discountPct ?? 0,
        lineTotal: l.quantity * l.unitPrice * (1 - (l.discountPct ?? 0) / 100),
        description: l.description,
      })),
    })
  }

  const updated = await prisma.salesQuote.update({
    where: { id },
    data: updateData,
    include: { lines: { include: { product: true } }, customer: true, store: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quote = await prisma.salesQuote.findUnique({ where: { id }, select: { status: true } })
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (quote.status !== 'draft') {
    return NextResponse.json({ error: 'Only draft quotes can be deleted' }, { status: 400 })
  }
  await prisma.salesQuote.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
