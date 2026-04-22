import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp        = req.nextUrl.searchParams
    const productId = sp.get('productId')
    const type      = sp.get('type')

    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId
    if (type)      where.type      = type

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    // Fetch products in a single query
    const productIds = [...new Set(transactions.map(t => t.productId))]
    const products   = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    })
    const productMap = Object.fromEntries(products.map(p => [p.id, p]))

    const enriched = transactions.map(t => ({
      id:        t.id,
      productId: t.productId,
      product:   productMap[t.productId] ?? null,
      storeId:   t.storeId,
      type:      t.type,
      quantity:  t.quantity,
      beforeQty: t.beforeQty,
      afterQty:  t.afterQty,
      reference: t.reference,
      notes:     t.notes,
      createdBy: t.createdBy,
      createdAt: t.createdAt,
    }))

    return NextResponse.json({ transactions: enriched, total: enriched.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
