import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Classification = 'active' | 'slow_moving' | 'aging' | 'dead_stock'

function classify(daysSince: number): Classification {
  if (daysSince <= 30) return 'active'
  if (daysSince <= 90) return 'slow_moving'
  if (daysSince <= 180) return 'aging'
  return 'dead_stock'
}

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  try {
    const now = new Date()

    const products = await prisma.product.findMany({
      where: {
        inventory: { some: { quantity: { gt: 0 } } },
      },
      include: {
        category: true,
        inventory: true,
        orderItems: {
          include: {
            order: {
              select: { status: true, createdAt: true },
            },
          },
          orderBy: { order: { createdAt: 'desc' } },
        },
      },
    })

    const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const cutoff90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const rows: string[] = []
    rows.push(
      [
        'Product',
        'SKU',
        'Category',
        'Qty',
        'Unit Cost',
        'Stock Value',
        'Last Sold',
        'Days Since Sold',
        'Classification',
        '30d Velocity',
      ]
        .map(escapeCSV)
        .join(','),
    )

    for (const product of products) {
      const currentQty = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)

      const completedItems = product.orderItems.filter(
        (oi) => oi.order.status === 'completed' || oi.order.status === 'paid',
      )

      let lastSoldDate: Date | null = null
      if (completedItems.length > 0) {
        lastSoldDate = completedItems[0].order.createdAt
      }

      const refDate = lastSoldDate ?? product.createdAt
      const daysSinceLastSold = Math.floor(
        (now.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24),
      )

      const velocity30d = completedItems
        .filter((oi) => oi.order.createdAt >= cutoff30)
        .reduce((sum, oi) => sum + oi.quantity, 0)

      const velocity90d = completedItems
        .filter((oi) => oi.order.createdAt >= cutoff90)
        .reduce((sum, oi) => sum + oi.quantity, 0)

      const unitCost = product.costPrice ?? 0
      const stockValue = currentQty * unitCost
      const classification = classify(daysSinceLastSold)

      rows.push(
        [
          product.name,
          product.sku,
          product.category?.name ?? '',
          currentQty,
          unitCost.toFixed(2),
          stockValue.toFixed(2),
          lastSoldDate ? lastSoldDate.toISOString().split('T')[0] : 'Never',
          daysSinceLastSold,
          classification,
          velocity30d,
          velocity90d,
        ]
          .map(escapeCSV)
          .join(','),
      )
    }

    const csv = rows.join('\r\n')
    const filename = `inventory-aging-${now.toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
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
