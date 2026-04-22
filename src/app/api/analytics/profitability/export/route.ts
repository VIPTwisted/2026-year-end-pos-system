import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const sp = req.nextUrl.searchParams
    const from = sp.get('from')
    const to = sp.get('to')
    const categoryId = sp.get('categoryId') || undefined

    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const toDate = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : new Date()

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: 'completed',
          createdAt: { gte: fromDate, lte: toDate },
        },
        ...(categoryId ? { product: { categoryId } } : {}),
      },
      include: {
        product: {
          include: {
            category: { select: { name: true } },
          },
        },
      },
    })

    // Aggregate by product
    const map = new Map<string, {
      name: string
      sku: string
      category: string
      unitsSold: number
      revenue: number
      cogs: number
    }>()

    for (const item of orderItems) {
      const existing = map.get(item.productId)
      const revenue = item.unitPrice * item.quantity
      const cogs = (item.product.costPrice ?? 0) * item.quantity

      if (existing) {
        existing.unitsSold += item.quantity
        existing.revenue += revenue
        existing.cogs += cogs
      } else {
        map.set(item.productId, {
          name: item.productName,
          sku: item.sku,
          category: item.product.category?.name ?? 'Uncategorized',
          unitsSold: item.quantity,
          revenue,
          cogs,
        })
      }
    }

    const rows = Array.from(map.values())
      .map((p) => {
        const grossProfit = p.revenue - p.cogs
        const marginPct = p.revenue > 0 ? (grossProfit / p.revenue) * 100 : 0
        return { ...p, grossProfit, marginPct }
      })
      .sort((a, b) => b.grossProfit - a.grossProfit)

    const escape = (v: string | number): string => {
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }

    const headers = ['Product Name', 'SKU', 'Category', 'Units Sold', 'Revenue', 'COGS', 'Gross Profit', 'Margin %']
    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          escape(r.name),
          escape(r.sku),
          escape(r.category),
          escape(r.unitsSold),
          escape(r.revenue.toFixed(2)),
          escape(r.cogs.toFixed(2)),
          escape(r.grossProfit.toFixed(2)),
          escape(r.marginPct.toFixed(2)),
        ].join(',')
      ),
    ]

    const csv = csvLines.join('\r\n')
    const fileName = `profitability-${fromDate.toISOString().slice(0, 10)}-to-${toDate.toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
