import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeOrders = searchParams.get('orders') === '1'

    const plans = await (prisma as any).masterPlan.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { plannedOrders: true, actionMessages: true } } },
    })

    if (!includeOrders) return NextResponse.json(plans)

    const orders = await (prisma as any).plannedOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json({ plans, orders })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { planId, horizon, includeSafety, explosionType } = body

    if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 })

    // Mark plan as running
    await (prisma as any).masterPlan.update({
      where: { id: planId },
      data: { status: 'running', updatedAt: new Date() },
    })

    // Get safety stock rules if requested
    const ssRules = includeSafety
      ? await (prisma as any).safetyStockRule.findMany({ where: { isActive: true } })
      : []

    const horizonDays: number = Number(horizon ?? 90)
    const now = new Date()

    // Generate planned orders based on safety stock rules and demand forecasts
    const ordersToCreate: {
      planId: string
      productName: string
      orderType: string
      qty: number
      needDate: Date
      status: string
      sourceName: string | null
      destinationName: string | null
    }[] = []

    // From safety stock rules — generate replenishment orders
    for (const rule of ssRules) {
      if (!rule.productName) continue
      const daysAhead = Math.min(horizonDays, rule.leadTimeDays * 3)
      const needDate  = new Date(now.getTime() + daysAhead * 86400000)
      ordersToCreate.push({
        planId,
        productName: rule.productName,
        orderType: 'purchase',
        qty: rule.reorderQty ?? rule.minQty,
        needDate,
        status: 'planned',
        sourceName: null,
        destinationName: rule.storeName ?? null,
      })
    }

    // From demand forecasts — generate production/purchase orders for upcoming periods
    const forecasts = await (prisma as any).demandForecast.findMany({
      include: { lines: true },
      take: 20,
    })

    const seen = new Set<string>()
    for (const fc of forecasts) {
      for (const line of fc.lines) {
        const name = line.productName ?? line.sku
        if (!name || seen.has(name)) continue
        seen.add(name)
        const daysAhead = Math.min(horizonDays, 30)
        const needDate  = new Date(now.getTime() + daysAhead * 86400000)
        const qty       = Math.round((line.forecastedQty ?? 50) * (horizonDays / 30))
        ordersToCreate.push({
          planId,
          productName: name,
          orderType: explosionType === 'backward' ? 'production' : 'purchase',
          qty,
          needDate,
          status: 'planned',
          sourceName: null,
          destinationName: null,
        })
      }
    }

    // Batch create orders
    const created = await (prisma as any).plannedOrder.createMany({
      data: ordersToCreate,
      skipDuplicates: false,
    })

    // Mark plan as completed
    await (prisma as any).masterPlan.update({
      where: { id: planId },
      data: { status: 'completed', lastRunAt: new Date(), updatedAt: new Date() },
    })

    return NextResponse.json({
      message: `Plan run complete: ${created.count} orders generated`,
      ordersGenerated: created.count,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
