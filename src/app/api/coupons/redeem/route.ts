import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, orderId, customerId, discount } = body

  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
    include: { promotion: true },
  })
  if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })

  const [redemption] = await prisma.$transaction([
    prisma.couponRedemption.create({
      data: {
        couponId: coupon.id,
        orderId: orderId ?? null,
        customerId: customerId ?? null,
        discount: discount ?? 0,
      },
    }),
    prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    }),
    prisma.promotion.update({
      where: { id: coupon.promotionId },
      data: { usedCount: { increment: 1 } },
    }),
  ])

  return NextResponse.json(redemption, { status: 201 })
}
