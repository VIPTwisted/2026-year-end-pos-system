import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Promotion } from '@prisma/client'

export interface ApplicablePromotion {
  id: string
  name: string
  discountType: string
  discountValue: number
  minOrderAmount: number | null
  autoApply: boolean
  isStackable: boolean
  isExclusive: boolean
  priority: number
  computedDiscount: number
}

/**
 * Evaluate a single promotion against the cart context.
 * Returns the computed discount amount (>= 0) if applicable, or -1 if not applicable.
 */
function evaluatePromotion(
  promo: Promotion,
  subtotal: number,
  productIds: string[],
): number {
  // Min order amount check
  if (promo.minOrderAmount != null && subtotal < promo.minOrderAmount) return -1

  // Scope/target check — if scoped to a product, at least one cart item must match
  if (promo.scope === 'product' && promo.targetProductId) {
    if (!productIds.includes(promo.targetProductId)) return -1
  }

  // If scoped to category we can't filter here without product data — allow through
  // (caller would need to pass categoryIds for stricter enforcement)

  // Calculate discount value
  let discount = 0
  if (promo.type === 'PERCENT_OFF') {
    discount = (subtotal * promo.value) / 100
    if (promo.maxDiscount != null) discount = Math.min(discount, promo.maxDiscount)
  } else if (promo.type === 'AMOUNT_OFF') {
    discount = Math.min(promo.value, subtotal)
  } else if (promo.type === 'BOGO' || promo.type === 'FREE_ITEM') {
    // BOGO / FREE_ITEM: value field holds the per-unit price discount, or 0 if not calculable here
    discount = promo.value
  } else if (promo.type === 'TIERED_SPEND') {
    // TIERED_SPEND: value is the flat discount triggered at minOrderAmount
    discount = promo.value
  } else if (promo.type === 'LOYALTY_BONUS') {
    // Loyalty bonus does not produce a cart discount — skip
    return -1
  }

  return Math.max(0, discount)
}

/**
 * GET /api/pos/promotions
 * Query params:
 *   subtotal=123.45          (required)
 *   productIds=id1,id2,id3   (optional, comma-separated)
 *   customerId=xxx            (optional — reserved for per-customer limit checks)
 *
 * Returns only autoApply=true promotions that are currently active and applicable.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const subtotalRaw = sp.get('subtotal')
    const productIdsRaw = sp.get('productIds')

    const subtotal = subtotalRaw ? parseFloat(subtotalRaw) : 0
    const productIds = productIdsRaw
      ? productIdsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const now = new Date()

    // Fetch all active, auto-apply promotions within their date window
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        autoApply: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })

    const applicable: ApplicablePromotion[] = []

    for (const promo of promotions) {
      // Skip if usage limit exhausted
      if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) continue

      const computedDiscount = evaluatePromotion(promo, subtotal, productIds)
      if (computedDiscount < 0) continue

      applicable.push({
        id: promo.id,
        name: promo.name,
        discountType: promo.type,
        discountValue: promo.value,
        minOrderAmount: promo.minOrderAmount,
        autoApply: promo.autoApply,
        isStackable: promo.isStackable,
        isExclusive: promo.isExclusive,
        priority: promo.priority,
        computedDiscount: Math.round(computedDiscount * 100) / 100,
      })
    }

    return NextResponse.json(applicable)
  } catch (e) {
    console.error('[GET /api/pos/promotions]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
