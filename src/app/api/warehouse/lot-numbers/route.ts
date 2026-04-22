import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')

  const lots = await prisma.lotNumber.findMany({
    where: productId ? { productId } : undefined,
    include: { product: { select: { id: true, name: true, sku: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(lots)
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    lotNo: string
    productId: string
    itemTrackingId?: string
    expirationDate?: string
    expiresAt?: string
    quantity?: number
    description?: string
    notes?: string
  }
  const lot = await prisma.lotNumber.create({
    data: {
      lotNo: body.lotNo,
      productId: body.productId,
      itemTrackingId: body.itemTrackingId ?? null,
      expiresAt: (body.expiresAt ?? body.expirationDate) ? new Date((body.expiresAt ?? body.expirationDate)!) : null,
      quantity: body.quantity ?? 0,
      quantityOnHand: body.quantity ?? 0,
      notes: body.notes ?? body.description ?? null,
    },
    include: { product: { select: { id: true, name: true, sku: true } } },
  })
  return NextResponse.json(lot, { status: 201 })
}
