import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entries = await prisma.priceBookEntry.findMany({
      where: { priceBookId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('GET /api/pricing/price-books/[id]/entries error:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { productId, productName, sku, basePrice, salePrice, minQty } = body
    if (basePrice === undefined) {
      return NextResponse.json({ error: 'basePrice is required' }, { status: 400 })
    }
    const entry = await prisma.priceBookEntry.create({
      data: {
        priceBookId: id,
        productId: productId ?? null,
        productName: productName ?? null,
        sku: sku ?? null,
        basePrice: Number(basePrice),
        salePrice: salePrice !== undefined ? Number(salePrice) : null,
        minQty: minQty ?? 1,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('POST /api/pricing/price-books/[id]/entries error:', error)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _priceBookId } = await params
    const { searchParams } = new URL(req.url)
    const entryId = searchParams.get('entryId')
    if (!entryId) return NextResponse.json({ error: 'entryId query param required' }, { status: 400 })
    await prisma.priceBookEntry.delete({ where: { id: entryId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/pricing/price-books/[id]/entries error:', error)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
