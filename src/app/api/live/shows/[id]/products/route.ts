import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const products = await prisma.liveShowProduct.findMany({
    where: { showId: id },
    orderBy: { position: 'asc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const lastProduct = await prisma.liveShowProduct.findFirst({
    where: { showId: id },
    orderBy: { position: 'desc' },
  })
  const position = (lastProduct?.position ?? -1) + 1
  const product = await prisma.liveShowProduct.create({
    data: {
      showId: id,
      productId: body.productId ?? null,
      productName: body.productName,
      sku: body.sku ?? null,
      price: parseFloat(body.price) || 0,
      salePrice: body.salePrice ? parseFloat(body.salePrice) : null,
      imageUrl: body.imageUrl ?? null,
      position,
    },
  })
  return NextResponse.json(product, { status: 201 })
}
