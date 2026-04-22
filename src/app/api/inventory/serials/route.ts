import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp        = req.nextUrl.searchParams
    const productId = sp.get('productId')
    const search    = sp.get('search') ?? ''

    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId

    const serials = await prisma.saleSerialNumber.findMany({
      where,
      include: {
        order: {
          include: {
            customer: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { soldAt: 'desc' },
      take: 200,
    })

    // Fetch products in a single query for all productIds present
    const productIds = [...new Set(serials.map(s => s.productId))]
    const products   = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    })
    const productMap = Object.fromEntries(products.map(p => [p.id, p]))

    // Apply optional search filter after enrichment (serial number or product name)
    const q = search.trim().toLowerCase()
    const enriched = serials
      .map(s => ({
        id:           s.id,
        serialNumber: s.serialNumber,
        productId:    s.productId,
        product:      productMap[s.productId] ?? null,
        orderId:      s.orderId,
        orderNumber:  s.order.orderNumber,
        soldAt:       s.soldAt,
        customer:     s.order.customer
          ? {
              id:   s.order.customer.id,
              name: `${s.order.customer.firstName} ${s.order.customer.lastName}`,
            }
          : null,
      }))
      .filter(s => {
        if (!q) return true
        return (
          s.serialNumber.toLowerCase().includes(q) ||
          (s.product?.name ?? '').toLowerCase().includes(q) ||
          (s.product?.sku ?? '').toLowerCase().includes(q) ||
          s.orderNumber.toLowerCase().includes(q)
        )
      })

    return NextResponse.json({ serials: enriched, total: enriched.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
