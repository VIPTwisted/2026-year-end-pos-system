import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const productId = searchParams.get('productId')
  const rating = searchParams.get('rating')

  const ratings = await prisma.ecomRating.findMany({
    where: {
      ...(status && { status }),
      ...(productId && { productId }),
      ...(rating && { rating: parseInt(rating) }),
    },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(ratings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const ratingRecord = await prisma.ecomRating.create({
    data: {
      productId: body.productId,
      reviewerName: body.reviewerName ?? null,
      email: body.email ?? null,
      rating: body.rating,
      title: body.title ?? null,
      body: body.body ?? null,
      status: body.status ?? 'pending',
      isVerified: body.isVerified ?? false,
    },
  })
  return NextResponse.json(ratingRecord, { status: 201 })
}
