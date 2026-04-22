import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lines = await prisma.priceListLine.findMany({
    where: { priceListId: id },
    include: { product: { select: { id: true, name: true, sku: true, salePrice: true } } },
    orderBy: [{ minQuantity: 'asc' }],
  })
  return NextResponse.json(lines)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const line = await prisma.priceListLine.create({
    data: {
      priceListId: id,
      productId: body.productId,
      unitPrice: parseFloat(body.unitPrice),
      minQuantity: body.minQuantity ? parseInt(body.minQuantity, 10) : 1,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
    include: { product: { select: { id: true, name: true, sku: true, salePrice: true } } },
  })
  return NextResponse.json(line, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: _priceListId } = await params
  const { searchParams } = new URL(req.url)
  const lineId = searchParams.get('lineId')
  if (!lineId) return NextResponse.json({ error: 'lineId required' }, { status: 400 })
  await prisma.priceListLine.delete({ where: { id: lineId } })
  return NextResponse.json({ ok: true })
}
