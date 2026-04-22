import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calculateDiscount(type: string, value: number, orderAmount: number, maxDiscount?: number | null): number {
  let discount = 0
  switch (type) {
    case 'PERCENT_OFF':
      discount = orderAmount * (value / 100)
      break
    case 'AMOUNT_OFF':
      discount = value
      break
    case 'BOGO':
      // Treat as a percentage discount; caller should compute exact BOGO savings
      discount = value
      break
    case 'FREE_ITEM':
      discount = value
      break
    case 'TIERED_SPEND':
      discount = value
      break
    case 'LOYALTY_BONUS':
      discount = value
      break
    default:
      discount = value
  }
  if (maxDiscount != null && discount > maxDiscount) discount = maxDiscount
  if (discount > orderAmount) discount = orderAmount
  return Math.round(discount * 100) / 100
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, orderAmount = 0, customerId, storeId } = body

  if (!code) return NextResponse.json({ valid: false, reason: 'No coupon code provided' })

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
    include: { promotion: true },
  })

  if (!coupon) return NextResponse.json({ valid: false, reason: 'Coupon code not found' })
  if (!coupon.isActive) return NextResponse.json({ valid: false, reason: 'Coupon is inactive' })

  const now = new Date()
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ valid: false, reason: 'Coupon has expired' })
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, reason: 'Coupon usage limit reached' })
  }

  const promo = coupon.promotion
  if (!promo.isActive) return NextResponse.json({ valid: false, reason: 'Promotion is inactive' })
  if (promo.startDate && promo.startDate > now) {
    return NextResponse.json({ valid: false, reason: 'Promotion has not started yet' })
  }
  if (promo.endDate && promo.endDate < now) {
    return NextResponse.json({ valid: false, reason: 'Promotion has ended' })
  }
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) {
    return NextResponse.json({ valid: false, reason: 'Promotion usage limit reached' })
  }
  if (promo.minOrderAmount != null && orderAmount < promo.minOrderAmount) {
    return NextResponse.json({
      valid: false,
      reason: `Minimum order amount of $${promo.minOrderAmount.toFixed(2)} required`,
    })
  }

  // Store restriction
  if (promo.allowedStoreIds && storeId) {
    try {
      const allowed: string[] = JSON.parse(promo.allowedStoreIds)
      if (allowed.length > 0 && !allowed.includes(storeId)) {
        return NextResponse.json({ valid: false, reason: 'Coupon not valid for this store' })
      }
    } catch {
      // ignore parse errors
    }
  }

  // Per-customer limit
  if (coupon.perCustomerLimit != null && customerId) {
    const customerUses = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, customerId },
    })
    if (customerUses >= coupon.perCustomerLimit) {
      return NextResponse.json({ valid: false, reason: 'You have reached the per-customer limit for this coupon' })
    }
  }

  const discount = calculateDiscount(promo.type, promo.value, orderAmount, promo.maxDiscount)

  return NextResponse.json({
    valid: true,
    coupon: { id: coupon.id, code: coupon.code },
    promotion: {
      id: promo.id,
      name: promo.name,
      type: promo.type,
      scope: promo.scope,
      value: promo.value,
      isExclusive: promo.isExclusive,
    },
    discount,
  })
}
