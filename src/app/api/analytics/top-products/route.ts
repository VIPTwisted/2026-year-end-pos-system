import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = parseInt(searchParams.get('limit') ?? '10')

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: fromDate, lte: toDate },
        status: 'completed',
      },
    },
    select: {
      productId: true,
      productName: true,
      sku: true,
      quantity: true,
      lineTotal: true,
    },
  })

  const productMap = new Map<string, { productId: string; productName: string; sku: string; unitsSold: number; revenue: number }>()
  for (const item of items) {
    if (!productMap.has(item.productId)) {
      productMap.set(item.productId, {
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        unitsSold: 0,
        revenue: 0,
      })
    }
    const p = productMap.get(item.productId)!
    p.unitsSold += item.quantity
    p.revenue += item.lineTotal
  }

  const totalRevenue = Array.from(productMap.values()).reduce((s, p) => s + p.revenue, 0)
  const products = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map(p => ({ ...p, pctOfTotal: totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0 }))

  return NextResponse.json({ products, totalRevenue })
}
