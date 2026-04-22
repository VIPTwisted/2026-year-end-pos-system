import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sku, qty = 1, customerGroup, priceBookId } = body

    if (!sku) return NextResponse.json({ error: 'sku is required' }, { status: 400 })

    const quantity = Number(qty)
    let basePrice = 0
    const appliedRules: { ruleName: string; ruleType: string; discountAmt: number; description: string }[] = []

    // 1. Resolve base price from price book or customer group
    if (priceBookId) {
      const entry = await prisma.priceBookEntry.findFirst({
        where: { priceBookId, sku },
        orderBy: { minQty: 'desc' },
      })
      if (entry && entry.minQty <= quantity) {
        basePrice = entry.salePrice ?? entry.basePrice
      } else if (entry) {
        basePrice = entry.basePrice
      }
    }

    if (basePrice === 0) {
      // Fallback: check default price book
      const defaultBook = await prisma.priceBook.findFirst({ where: { isDefault: true, isActive: true } })
      if (defaultBook) {
        const entry = await prisma.priceBookEntry.findFirst({
          where: { priceBookId: defaultBook.id, sku },
        })
        if (entry) basePrice = entry.salePrice ?? entry.basePrice
      }
    }

    // 2. Check customer group price override
    if (customerGroup) {
      const groupPrice = await prisma.customerGroupPrice.findFirst({
        where: { groupName: customerGroup, sku, isActive: true },
      })
      if (groupPrice) {
        const prevBase = basePrice
        if (groupPrice.discountPct) {
          const discount = prevBase * (groupPrice.discountPct / 100) * quantity
          appliedRules.push({
            ruleName: `${customerGroup} Group Discount`,
            ruleType: 'CUSTOMER_GROUP',
            discountAmt: discount,
            description: `${groupPrice.discountPct}% group discount`,
          })
          basePrice = basePrice * (1 - groupPrice.discountPct / 100)
        } else {
          const diff = (prevBase - groupPrice.priceOverride) * quantity
          if (diff > 0) {
            appliedRules.push({
              ruleName: `${customerGroup} Price Override`,
              ruleType: 'CUSTOMER_GROUP',
              discountAmt: diff,
              description: `Override price: $${groupPrice.priceOverride.toFixed(2)}`,
            })
          }
          basePrice = groupPrice.priceOverride
        }
      }
    }

    // 3. Apply matching price rules
    const now = new Date()
    const rules = await prisma.priceRule.findMany({
      where: {
        isActive: true,
        OR: [{ validFrom: null }, { validFrom: { lte: now } }],
        AND: [{ OR: [{ validTo: null }, { validTo: { gte: now } }] }],
      },
      orderBy: { priority: 'desc' },
    })

    let runningPrice = basePrice
    let firstRuleApplied = false

    for (const rule of rules) {
      if (!firstRuleApplied || rule.stackable) {
        let condition: { minQty?: number; minSpend?: number; skus?: string[] } = {}
        try {
          condition = rule.conditionJson ? JSON.parse(rule.conditionJson) : {}
        } catch { condition = {} }

        let action: { discountPct?: number; discountAmt?: number } = {}
        try {
          action = rule.actionJson ? JSON.parse(rule.actionJson) : {}
        } catch { action = {} }

        const skuMatch = !condition.skus || condition.skus.includes(sku)
        const qtyMatch = !condition.minQty || quantity >= condition.minQty
        const spendMatch = !condition.minSpend || runningPrice * quantity >= condition.minSpend

        if (skuMatch && qtyMatch && spendMatch) {
          let discountAmt = 0
          let desc = ''

          if (rule.ruleType === 'PCT_DISCOUNT' && action.discountPct) {
            discountAmt = runningPrice * (action.discountPct / 100) * quantity
            desc = `${action.discountPct}% off`
          } else if (rule.ruleType === 'FIXED_DISCOUNT' && action.discountAmt) {
            discountAmt = action.discountAmt * quantity
            desc = `$${action.discountAmt.toFixed(2)} off per unit`
          } else if (rule.ruleType === 'BULK_DISCOUNT' && action.discountPct && condition.minQty && quantity >= condition.minQty) {
            discountAmt = runningPrice * (action.discountPct / 100) * quantity
            desc = `Bulk: ${action.discountPct}% off for qty ≥ ${condition.minQty}`
          } else if (rule.ruleType === 'BOGO') {
            const freePairs = Math.floor(quantity / 2)
            discountAmt = runningPrice * freePairs
            desc = `BOGO: ${freePairs} unit(s) free`
          }

          if (discountAmt > 0) {
            appliedRules.push({
              ruleName: rule.name,
              ruleType: rule.ruleType,
              discountAmt,
              description: desc,
            })
            runningPrice = Math.max(0, runningPrice - discountAmt / quantity)
            firstRuleApplied = true
          }
        }
      }
    }

    const totalDiscount = appliedRules.reduce((sum, r) => sum + r.discountAmt, 0)
    const finalPrice = Math.max(0, basePrice * quantity - totalDiscount)
    const savingsPct = basePrice > 0 ? ((totalDiscount / (basePrice * quantity)) * 100) : 0

    return NextResponse.json({
      sku,
      qty: quantity,
      basePrice,
      appliedRules,
      finalPrice,
      discountAmt: totalDiscount,
      savingsPct: Math.round(savingsPct * 100) / 100,
      priceBookId: priceBookId ?? null,
      customerGroup: customerGroup ?? null,
    })
  } catch (error) {
    console.error('POST /api/pricing/simulate error:', error)
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 })
  }
}
