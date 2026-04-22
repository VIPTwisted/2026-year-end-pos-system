import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALPHA = 0.3

interface WeeklyBucket {
  week: string
  unitsSold: number
}

function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function getUrgencyLevel(daysOfStock: number): 'critical' | 'low' | 'medium' | 'healthy' {
  if (daysOfStock < 7) return 'critical'
  if (daysOfStock < 14) return 'low'
  if (daysOfStock < 30) return 'medium'
  return 'healthy'
}

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const periodsParam = sp.get('periods')
    const periods = Math.max(1, Math.min(52, parseInt(periodsParam ?? '3', 10) || 3))

    const now = new Date()
    const twelveWeeksAgo = new Date(now)
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        salePrice: true,
        costPrice: true,
        category: { select: { name: true } },
        inventory: { select: { quantity: true } },
      },
    })

    const productsWithInventory = products.filter(p => p.inventory.length > 0)
    const productIds = productsWithInventory.map(p => p.id)

    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: { in: productIds },
        order: {
          createdAt: { gte: twelveWeeksAgo, lte: now },
          status: 'completed',
        },
      },
      select: {
        productId: true,
        quantity: true,
        order: { select: { createdAt: true } },
      },
    })

    const salesByProduct = new Map<string, Map<string, number>>()
    for (const item of orderItems) {
      const week = isoWeek(new Date(item.order.createdAt))
      if (!salesByProduct.has(item.productId)) {
        salesByProduct.set(item.productId, new Map())
      }
      const weekMap = salesByProduct.get(item.productId)!
      weekMap.set(week, (weekMap.get(week) ?? 0) + item.quantity)
    }

    const weekLabels: string[] = []
    for (let w = 11; w >= 0; w--) {
      const d = new Date(now)
      d.setDate(d.getDate() - w * 7)
      weekLabels.push(isoWeek(d))
    }

    const rows: string[][] = []
    const header = [
      'Product Name',
      'SKU',
      'Category',
      'Current Qty',
      'Avg Weekly Demand',
      'Forecasted Demand',
      'Recommended Order Qty',
      'Days of Stock',
      'Urgency Level',
      'Est. Order Cost',
    ]
    rows.push(header)

    for (const product of productsWithInventory) {
      const currentQty = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
      const weekMap = salesByProduct.get(product.id) ?? new Map<string, number>()

      const weeklyHistory: WeeklyBucket[] = weekLabels.map(week => ({
        week,
        unitsSold: weekMap.get(week) ?? 0,
      }))

      let smoothedDemand = 0
      let initialized = false
      for (const bucket of weeklyHistory) {
        if (!initialized) {
          smoothedDemand = bucket.unitsSold
          initialized = true
        } else {
          smoothedDemand = ALPHA * bucket.unitsSold + (1 - ALPHA) * smoothedDemand
        }
      }

      const totalSold = weeklyHistory.reduce((s, b) => s + b.unitsSold, 0)
      const avgWeeklyDemand = Math.round((totalSold / 12) * 100) / 100
      const forecastedDemand = Math.round(smoothedDemand * periods * 100) / 100
      const daysOfStock =
        avgWeeklyDemand === 0
          ? 999
          : Math.round((currentQty / avgWeeklyDemand) * 7 * 10) / 10
      const recommendedOrderQty = Math.max(0, Math.round((forecastedDemand - currentQty) * 100) / 100)
      const urgencyLevel = getUrgencyLevel(daysOfStock)
      const estOrderCost = Math.round(recommendedOrderQty * product.costPrice * 100) / 100

      rows.push([
        product.name,
        product.sku,
        product.category?.name ?? 'Uncategorized',
        String(Math.round(currentQty * 100) / 100),
        String(avgWeeklyDemand),
        String(forecastedDemand),
        String(recommendedOrderQty),
        String(daysOfStock),
        urgencyLevel,
        String(estOrderCost),
      ])
    }

    // Sort by urgency then days of stock
    const urgencyOrder: Record<string, number> = {
      critical: 0,
      low: 1,
      medium: 2,
      healthy: 3,
    }
    const dataRows = rows.slice(1)
    dataRows.sort((a, b) => {
      const urgDiff = (urgencyOrder[a[8]] ?? 4) - (urgencyOrder[b[8]] ?? 4)
      if (urgDiff !== 0) return urgDiff
      return parseFloat(a[7]) - parseFloat(b[7])
    })

    const allRows = [rows[0], ...dataRows]
    const csv = allRows.map(row => row.map(escapeCsv).join(',')).join('\r\n')

    const filename = `demand-forecast-${periods}w-${now.toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
