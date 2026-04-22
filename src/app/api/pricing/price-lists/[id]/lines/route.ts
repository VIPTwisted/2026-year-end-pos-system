import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lines = await prisma.priceListLine.findMany({
      where: { priceListId: id },
      include: {
        product: { select: { id: true, sku: true, name: true, salePrice: true, imageUrl: true } },
      },
      orderBy: [{ productId: 'asc' }, { minQty: 'asc' }],
    })
    return NextResponse.json(lines)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      productId: string
      minQty?: number
      unitPrice: number
      discountPct?: number
    }

    if (!body.productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }
    if (body.unitPrice === undefined || body.unitPrice < 0) {
      return NextResponse.json({ error: 'unitPrice is required and must be >= 0' }, { status: 400 })
    }

    const line = await prisma.priceListLine.create({
      data: {
        priceListId: id,
        productId: body.productId,
        minQty: body.minQty ?? 1,
        unitPrice: body.unitPrice,
        discountPct: body.discountPct ?? 0,
      },
      include: {
        product: { select: { id: true, sku: true, name: true, salePrice: true, imageUrl: true } },
      },
    })

    return NextResponse.json(line, { status: 201 })
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error && e.message.includes('Unique constraint')
      ? 'A line for this product and minimum quantity already exists'
      : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: msg.includes('already') ? 409 : 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _priceListId } = await params
    const lineId = req.nextUrl.searchParams.get('lineId')

    if (!lineId) {
      return NextResponse.json({ error: 'lineId query param is required' }, { status: 400 })
    }

    await prisma.priceListLine.delete({ where: { id: lineId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
