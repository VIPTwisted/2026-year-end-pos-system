import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pricing/unified
// Aggregates PriceRule + PriceBook into a unified list with KPI stats
export async function GET() {
  try {
    const [priceRules, priceBooks, priceGroups] = await Promise.all([
      prisma.priceRule.findMany({
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.priceBook.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.priceGroup.count({ where: { isActive: true } }),
    ])

    // Map PriceRule → unified shape
    const fromRules = priceRules.map(r => ({
      id:         r.id,
      name:       r.name,
      ruleType:   r.ruleType,
      priority:   r.priority,
      validFrom:  r.validFrom?.toISOString() ?? null,
      validTo:    r.validTo?.toISOString() ?? null,
      channels:   [] as string[],   // PriceRule has no channel field; extend via conditionJson if needed
      isActive:   r.isActive,
      source:     'price_rule' as const,
    }))

    // Map PriceBook → unified shape (trade agreements)
    const fromBooks = priceBooks.map(b => ({
      id:         b.id,
      name:       b.name,
      ruleType:   'base' as string,
      priority:   0,
      validFrom:  b.validFrom?.toISOString() ?? null,
      validTo:    b.validTo?.toISOString() ?? null,
      channels:   [] as string[],
      isActive:   b.isActive,
      source:     'price_book' as const,
    }))

    const rules = [...fromRules, ...fromBooks]

    const stats = {
      activeRules:      priceRules.filter(r => r.isActive).length,
      priceGroups:      priceGroups,
      b2bAccounts:      priceRules.filter(r => r.ruleType === 'CUSTOMER_GROUP' && r.isActive).length,
      tradeAgreements:  priceBooks.length,
    }

    return NextResponse.json({ stats, rules })
  } catch (err) {
    console.error('[unified-pricing GET]', err)
    return NextResponse.json({ error: 'Failed to fetch unified pricing' }, { status: 500 })
  }
}

// POST /api/pricing/unified
// Creates a new PriceRule with channel + qty-break metadata stored in conditionJson
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name, ruleType, priority, channels, customerGroups,
      qtyBreaks, validFrom, validTo, isActive, description,
    } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const conditionJson = JSON.stringify({ channels, customerGroups, qtyBreaks })

    const rule = await prisma.priceRule.create({
      data: {
        name:         name.trim(),
        description:  description ?? null,
        ruleType:     ruleType ?? 'discount',
        priority:     Number(priority) || 0,
        conditionJson,
        isActive:     isActive ?? true,
        validFrom:    validFrom ? new Date(validFrom) : null,
        validTo:      validTo   ? new Date(validTo)   : null,
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (err) {
    console.error('[unified-pricing POST]', err)
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}
