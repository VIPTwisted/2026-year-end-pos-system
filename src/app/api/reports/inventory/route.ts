import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        inventory: true,
        category: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    })

    let totalStockValue = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    const productRows = products.map(p => {
      const totalQty = p.inventory.reduce((s, inv) => s + inv.quantity, 0)
      const stockValue = p.salePrice * totalQty
      totalStockValue += stockValue

      const reorderPoint = p.reorderPoint ?? 5
      const isOut = totalQty === 0
      const isLow = !isOut && totalQty <= reorderPoint

      if (isOut) outOfStockCount++
      else if (isLow) lowStockCount++

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name ?? 'Uncategorized',
        quantity: totalQty,
        unitPrice: p.salePrice,
        stockValue,
        reorderPoint,
        status: isOut ? 'out_of_stock' : isLow ? 'low_stock' : 'in_stock',
      }
    })

    const totalProducts = products.length
    const totalSKUs = products.length

    const topByValue = [...productRows]
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 20)

    const lowStock = productRows
      .filter(p => p.status === 'low_stock' || p.status === 'out_of_stock')
      .sort((a, b) => a.quantity - b.quantity)

    return NextResponse.json({
      totalProducts,
      totalSKUs,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
      products: productRows.sort((a, b) => b.stockValue - a.stockValue),
      topByValue,
      lowStock,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
