import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ReorderItem {
  productId: string
  productName: string
  sku: string
  supplierId: string | null
  supplierName: string | null
  currentQty: number
  reorderPoint: number
  reorderQty: number
  unitCost: number
  totalCost: number
  daysOfStock: number | null
}

export async function GET(_req: NextRequest) {
  try {
    // Fetch all inventory records where quantity <= product.reorderPoint
    const inventoryRecords = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    })

    // Filter to items at or below reorder point
    const belowReorder = inventoryRecords.filter(inv => {
      const rp = inv.product.reorderPoint
      return rp !== null && rp !== undefined && inv.quantity <= rp
    })

    if (belowReorder.length === 0) {
      return NextResponse.json({
        items: [],
        summary: { itemCount: 0, totalReorderCost: 0, supplierCount: 0 },
      })
    }

    // Get avg daily sales for each product from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const productIds = belowReorder.map(inv => inv.productId)

    const salesData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'voided' },
        },
      },
      _sum: { quantity: true },
    })

    const salesMap = new Map<string, number>()
    for (const s of salesData) {
      salesMap.set(s.productId, s._sum.quantity ?? 0)
    }

    const items: ReorderItem[] = belowReorder.map(inv => {
      const product = inv.product
      const rp = product.reorderPoint ?? 0
      const reorderQty = product.reorderQty ?? rp * 2
      const unitCost = product.costPrice ?? 0
      const totalCost = reorderQty * unitCost

      const totalSold30 = salesMap.get(product.id) ?? 0
      const avgDailySales = totalSold30 / 30

      let daysOfStock: number | null = null
      if (avgDailySales > 0) {
        daysOfStock = Math.floor(inv.quantity / avgDailySales)
      }

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        supplierId: product.supplierId ?? null,
        supplierName: product.supplier?.name ?? null,
        currentQty: inv.quantity,
        reorderPoint: rp,
        reorderQty,
        unitCost,
        totalCost,
        daysOfStock,
      }
    })

    // Sort by daysOfStock asc (most urgent first); null (no sales data) goes to end
    items.sort((a, b) => {
      if (a.daysOfStock === null && b.daysOfStock === null) return 0
      if (a.daysOfStock === null) return 1
      if (b.daysOfStock === null) return -1
      return a.daysOfStock - b.daysOfStock
    })

    const totalReorderCost = items.reduce((sum, i) => sum + i.totalCost, 0)
    const uniqueSuppliers = new Set(items.map(i => i.supplierId).filter(Boolean))

    return NextResponse.json({
      items,
      summary: {
        itemCount: items.length,
        totalReorderCost,
        supplierCount: uniqueSuppliers.size,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
