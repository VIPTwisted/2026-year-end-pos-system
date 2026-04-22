import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const productId = req.nextUrl.searchParams.get('productId')

  const reviews = await prisma.productReview.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(productId ? { productId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const review = await prisma.productReview.create({
    data: {
      productId: body.productId ?? null,
      productName: body.productName ?? null,
      sku: body.sku ?? null,
      customerId: body.customerId ?? null,
      customerName: body.customerName ?? null,
      rating: body.rating,
      title: body.title ?? null,
      body: body.body ?? null,
      verifiedPurchase: body.verifiedPurchase ?? false,
      status: body.status ?? 'pending',
      locale: body.locale ?? 'en-us',
      siteId: body.siteId ?? null,
    },
  })
  return NextResponse.json(review, { status: 201 })
}
