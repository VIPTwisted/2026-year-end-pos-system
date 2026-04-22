import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { productId } = body

  await prisma.liveShowProduct.updateMany({
    where: { showId: id, status: 'featured' },
    data: { status: 'queued' },
  })

  const product = await prisma.liveShowProduct.update({
    where: { id: productId },
    data: { status: 'featured', featuredAt: new Date() },
  })

  await prisma.liveShowEvent.create({
    data: {
      showId: id,
      eventType: 'product-featured',
      data: JSON.stringify({
        productId: product.id,
        productName: product.productName,
        price: product.salePrice ?? product.price,
        featuredAt: new Date(),
      }),
    },
  })

  return NextResponse.json(product)
}
