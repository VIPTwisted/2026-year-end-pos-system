import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Dimension constants — keep in sync with the page component
const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum']
const TIER_DEFAULTS: Record<string, number> = {
  Standard:  1.00,
  Silver:    0.95,
  Gold:      0.90,
  Platinum:  0.85,
}

// GET /api/pricing/price-structures
// Returns the pricing matrix derived from PriceGroup + CustomerGroupPrice
export async function GET() {
  try {
    const groups = await prisma.priceGroup.findMany({
      where: { isActive: true },
    })

    const overrides = await prisma.customerGroupPrice.findMany({
      where: { isActive: true },
    })

    // Build a flat matrix: for each (tier × category) we resolve the multiplier
    // CustomerGroupPrice.groupName maps to a tier name
    // We synthesise "category" from productName when available, else "General"

    // Aggregate unique categories from overrides
    const rawCategories = [...new Set(overrides.map(o => o.productName ?? 'General'))]
    const categories = rawCategories.length > 0 ? rawCategories : [
      'Electronics', 'Apparel', 'Home & Garden', 'Food & Beverage',
      'Health & Beauty', 'Automotive', 'Office Supplies', 'Sports & Outdoors',
    ]

    const cells = categories.flatMap(category =>
      TIERS.map(tier => {
        const match = overrides.find(
          o => o.groupName === tier && (o.productName === category || (!o.productName && category === 'General'))
        )
        return {
          tier,
          category,
          multiplier: match?.discountPct != null
            ? 1 - (match.discountPct / 100)
            : (TIER_DEFAULTS[tier] ?? 1.0),
          override: match?.priceOverride ?? null,
        }
      })
    )

    return NextResponse.json({ cells, groups: groups.map(g => ({ id: g.id, code: g.code, name: g.name })) })
  } catch (err) {
    console.error('[price-structures GET]', err)
    return NextResponse.json({ error: 'Failed to fetch price structures' }, { status: 500 })
  }
}

// PATCH /api/pricing/price-structures
// Upsert a single matrix cell (tier + category → multiplier / override)
export async function PATCH(req: Request) {
  try {
    const { tier, category, multiplier, override } = await req.json()

    if (!tier || !category) {
      return NextResponse.json({ error: 'tier and category are required' }, { status: 400 })
    }

    // Map multiplier → discountPct for storage in CustomerGroupPrice
    const discountPct = override != null ? null : Math.round((1 - multiplier) * 10000) / 100

    // Upsert: find existing record or create
    const existing = await prisma.customerGroupPrice.findFirst({
      where: { groupName: tier, productName: category },
    })

    if (existing) {
      await prisma.customerGroupPrice.update({
        where: { id: existing.id },
        data: {
          discountPct: discountPct ?? undefined,
          priceOverride: override ?? existing.priceOverride,
        },
      })
    } else {
      await prisma.customerGroupPrice.create({
        data: {
          groupName:     tier,
          productName:   category,
          priceOverride: override ?? 0,
          discountPct:   discountPct ?? undefined,
          isActive:      true,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[price-structures PATCH]', err)
    return NextResponse.json({ error: 'Failed to update cell' }, { status: 500 })
  }
}
