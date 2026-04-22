import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        promotion: true,
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(coupons)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      code: string
      discountType: string
      discountValue: number
      minOrderAmount?: number
      maxUses?: number
      expiresAt?: string
      description?: string
    }

    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt, description } = body

    if (!code || !discountType || discountValue == null) {
      return NextResponse.json({ error: 'code, discountType, and discountValue are required' }, { status: 400 })
    }

    const normalizedCode = code.toUpperCase().trim()

    const existing = await prisma.coupon.findUnique({ where: { code: normalizedCode } })
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
    }

    // Map UI discountType to Promotion.type
    const promoType = discountType === 'percentage' ? 'PERCENT_OFF' : 'AMOUNT_OFF'

    const coupon = await prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.create({
        data: {
          name: `Coupon: ${normalizedCode}`,
          description: description ?? null,
          type: promoType,
          scope: 'order',
          value: discountValue,
          minOrderAmount: minOrderAmount ?? null,
          usageLimit: maxUses ?? null,
          isActive: true,
          autoApply: false,
          isStackable: false,
          isExclusive: false,
          priority: 0,
          usedCount: 0,
        },
      })

      return tx.coupon.create({
        data: {
          code: normalizedCode,
          promotionId: promotion.id,
          description: description ?? null,
          isActive: true,
          usedCount: 0,
          usageLimit: maxUses ?? null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
        include: { promotion: true, _count: { select: { redemptions: true } } },
      })
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
