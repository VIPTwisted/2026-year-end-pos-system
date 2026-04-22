import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const status = searchParams.get('status')

  const serials = await prisma.serialNumber.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(status ? { status } : {}),
    },
    include: { product: { select: { id: true, name: true, sku: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(serials)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const serial = await prisma.serialNumber.create({
    data: {
      serialNo: body.serialNo,
      productId: body.productId,
      itemTrackingId: body.itemTrackingId ?? null,
      status: body.status ?? 'available',
      warrantyDate: body.warrantyDate ? new Date(body.warrantyDate) : null,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      soldDate: body.soldDate ? new Date(body.soldDate) : null,
    },
    include: { product: { select: { id: true, name: true, sku: true } } },
  })
  return NextResponse.json(serial, { status: 201 })
}
