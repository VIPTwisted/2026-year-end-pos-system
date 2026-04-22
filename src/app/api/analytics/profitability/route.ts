import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ProductProfitability {
  id: string
  name: string
  sku: string
  category: string
  unitsSold: number
  revenue: number
  cogs: number
  grossProfit: number
  marginPct: number
  avgSellPrice: number
  currentStock: number
}

interface ProfitabilityResponse {
  products: ProductProfitability[]
  summary: {
    totalRevenue: number
    totalCOGS: number
    totalGrossProfit: number
    avgMarginPct: number
    bestMarginProduct: string
    worstMarginProduct: string
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<ProfitabilityResponse | { error: string }>> {
  try {
    const sp = req.nextUrl.searchParams
    const from = sp.get('from')
    const to = sp.get('to')
    const categoryId = sp.get('categoryId') || undefined

    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const toDate = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : new Date()

    // Fetch all completed order items in the period with product + category info
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: 'completed',
          createdAt: { gte: fromDate, lte: toDate },
        },
        ...(categoryId
          ? { product: { categoryId } }
          : {}),
      },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true } },
            inventory: { select: { quantity: true } },
          },
        },
      },
    })

    // Aggregate by product
    const map = new Map<string, {
      id: string
      name: string
      sku: string
      category: string
      costPrice: number
      unitsSold: number
      revenue: number
      cogs: number
      currentStock: number
    }>()

    for (const item of orderItems) {
      const existing = map.get(item.productId)
      const revenue = item.unitPrice * item.quantity
      const cogs = (item.product.costPrice ?? 0) * item.quantity
      const stock = item.product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)

      if (existing) {
        existing.unitsSold += item.quantity
        existing.revenue += revenue
        existing.cogs += cogs
      } else {
        map.set(item.productId, {
          id: item.productId,
          name: item.productName,
          sku: item.sku,
          category: item.product.category?.name ?? 'Uncategorized',
          costPrice: item.product.costPrice ?? 0,
          unitsSold: item.quantity,
          revenue,
          cogs,
          currentStock: stock,
        })
      }
    }

    const products: ProductProfitability[] = Array.from(map.values())
      .map((p) => {
        const grossProfit = p.revenue - p.cogs
        const marginPct = p.revenue > 0 ? (grossProfit / p.revenue) * 100 : 0
        const avgSellPrice = p.unitsSold > 0 ? p.revenue / p.unitsSold : 0
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          unitsSold: p.unitsSold,
          revenue: p.revenue,
          cogs: p.cogs,
          grossProfit,
          marginPct,
          avgSellPrice,
          currentStock: p.currentStock,
        }
      })
      .sort((a, b) => b.grossProfit - a.grossProfit)

    const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)
    const totalCOGS = products.reduce((s, p) => s + p.cogs, 0)
    const totalGrossProfit = totalRevenue - totalCOGS
    const avgMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0

    const bestMarginProduct = products.length > 0
      ? [...products].sort((a, b) => b.marginPct - a.marginPct)[0].name
      : ''
    const worstMarginProduct = products.length > 0
      ? [...products].sort((a, b) => a.marginPct - b.marginPct)[0].name
      : ''

    return NextResponse.json({
      products,
      summary: {
        totalRevenue,
        totalCOGS,
        totalGrossProfit,
        avgMarginPct,
        bestMarginProduct,
        worstMarginProduct,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
