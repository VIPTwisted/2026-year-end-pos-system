import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const reviews = await prisma.fraudReview.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const review = await prisma.fraudReview.create({
    data: {
      orderId: body.orderId ?? null,
      orderNumber: body.orderNumber ?? null,
      customerId: body.customerId ?? null,
      customerEmail: body.customerEmail ?? null,
      customerIp: body.customerIp ?? null,
      riskScore: body.riskScore ?? 0,
      triggeredRules: body.triggeredRules ?? null,
      status: body.status ?? 'pending',
      notes: body.notes ?? null,
      orderAmount: body.orderAmount ?? null,
    },
  })
  return NextResponse.json(review, { status: 201 })
}
