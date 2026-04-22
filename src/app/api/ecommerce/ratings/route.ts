import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const isApproved = searchParams.get('isApproved')

  const ratings = await prisma.productRating.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(isApproved !== null ? { isApproved: isApproved === 'true' } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      customer: { select: { id: true, firstName: true, lastName: true } },
      channel: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(ratings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rating = await prisma.productRating.create({
    data: {
      productId: body.productId,
      channelId: body.channelId || undefined,
      customerId: body.customerId || undefined,
      rating: body.rating,
      title: body.title || undefined,
      body: body.body || undefined,
      isVerified: body.isVerified ?? false,
      isApproved: false,
    },
  })
  return NextResponse.json(rating, { status: 201 })
}
