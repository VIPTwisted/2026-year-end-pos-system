import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALPHA = 0.3 // exponential smoothing factor

interface WeeklyBucket {
  week: string
  unitsSold: number
}

interface ForecastProduct {
  productId: string
  name: string
  sku: string
  category: string
  currentQty: number
  avgWeeklyDemand: number
  forecastedDemand: number
  daysOfStock: number
  recommendedOrderQty: number
  urgencyLevel: 'critical' | 'low' | 'medium' | 'healthy'
  weeklyHistory: WeeklyBucket[]
}

function isoWeek(date: Date): string {
  // Returns YYYY-Www per ISO 8601
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

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const periodsParam = sp.get('periods')
    const periods = Math.max(1, Math.min(52, parseInt(periodsParam ?? '3', 10) || 3))

    // 12 weeks lookback window
    const now = new Date()
    const twelveWeeksAgo = new Date(now)
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84) // 12 * 7

    // Fetch all products that have inventory records
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        salePrice: true,
        category: { select: { name: true } },
        inventory: {
          select: { quantity: true },
        },
      },
    })

    // Only products that have at least one inventory record
    const productsWithInventory = products.filter(p => p.inventory.length > 0)

    // Fetch all order items for the past 12 weeks for these products
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

    // Build week → unitsSold map per product
    const salesByProduct = new Map<string, Map<string, number>>()
    for (const item of orderItems) {
      const week = isoWeek(new Date(item.order.createdAt))
      if (!salesByProduct.has(item.productId)) {
        salesByProduct.set(item.productId, new Map())
      }
      const weekMap = salesByProduct.get(item.productId)!
      weekMap.set(week, (weekMap.get(week) ?? 0) + item.quantity)
    }

    // Build list of the 12 week labels (oldest → newest)
    const weekLabels: string[] = []
    for (let w = 11; w >= 0; w--) {
      const d = new Date(now)
      d.setDate(d.getDate() - w * 7)
      weekLabels.push(isoWeek(d))
    }

    const forecastProducts: ForecastProduct[] = []

    for (const product of productsWithInventory) {
      const currentQty = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
      const weekMap = salesByProduct.get(product.id) ?? new Map<string, number>()

      // Build weekly history array (12 weeks)
      const weeklyHistory: WeeklyBucket[] = weekLabels.map(week => ({
        week,
        unitsSold: Math.round((weekMap.get(week) ?? 0) * 100) / 100,
      }))

      // Simple exponential smoothing over 12 weeks
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

      // Average weekly demand from raw data (sum / 12)
      const totalSold = weeklyHistory.reduce((s, b) => s + b.unitsSold, 0)
      const avgWeeklyDemand = Math.round((totalSold / 12) * 100) / 100

      // Forecasted demand over requested periods using smoothed value
      const forecastedDemand = Math.round(smoothedDemand * periods * 100) / 100

      // Days of stock: if no demand, treat as 999 (effectively infinite)
      const daysOfStock =
        avgWeeklyDemand === 0
          ? 999
          : Math.round((currentQty / avgWeeklyDemand) * 7 * 10) / 10

      const recommendedOrderQty = Math.max(0, Math.round((forecastedDemand - currentQty) * 100) / 100)
      const urgencyLevel = getUrgencyLevel(daysOfStock)

      forecastProducts.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category?.name ?? 'Uncategorized',
        currentQty: Math.round(currentQty * 100) / 100,
        avgWeeklyDemand,
        forecastedDemand,
        daysOfStock,
        recommendedOrderQty,
        urgencyLevel,
        weeklyHistory,
      })
    }

    // Sort: critical first, then by daysOfStock asc
    const urgencyOrder: Record<string, number> = {
      critical: 0,
      low: 1,
      medium: 2,
      healthy: 3,
    }
    forecastProducts.sort((a, b) => {
      const urgDiff = urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]
      if (urgDiff !== 0) return urgDiff
      return a.daysOfStock - b.daysOfStock
    })

    const criticalCount = forecastProducts.filter(p => p.urgencyLevel === 'critical').length

    // Estimate recommended spend using salePrice as proxy (costPrice not available in select)
    // We need salePrice per product — rebuild a price map
    const priceMap = new Map<string, number>()
    for (const p of products) {
      priceMap.set(p.id, p.salePrice)
    }
    const totalRecommendedSpend = forecastProducts.reduce((sum, p) => {
      return sum + p.recommendedOrderQty * (priceMap.get(p.productId) ?? 0)
    }, 0)

    return NextResponse.json({
      generatedAt: now.toISOString(),
      forecastPeriod: periods,
      products: forecastProducts,
      summary: {
        criticalCount,
        totalRecommendedSpend: Math.round(totalRecommendedSpend * 100) / 100,
        productsForecasted: forecastProducts.length,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
