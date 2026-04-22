/**
 * API: Serial Numbers
 * GET /api/inventory/serial-numbers  — list serial numbers sold at POS
 *
 * Uses prisma.saleSerialNumber model (linked to orders).
 * Canonical endpoint for /inventory/serial-numbers/ UI.
 *
 * TODO: When standalone SerialNumber model is expanded, add POST here.
 *   Required SerialNumber fields: serialNo, productId, orderId?, soldAt?,
 *   customerId?, warrantyExpiry?, status (active/voided/returned), notes
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp        = req.nextUrl.searchParams
    const productId = sp.get('productId')
    const search    = sp.get('search') ?? ''

    const serials = await prisma.saleSerialNumber.findMany({
      where: productId ? { productId } : undefined,
      include: {
        order: {
          include: {
            customer: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { soldAt: 'desc' },
      take:    300,
    })

    const productIds = [...new Set(serials.map(s => s.productId))]
    const products   = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    })
    const productMap = Object.fromEntries(products.map(p => [p.id, p]))

    const q        = search.trim().toLowerCase()
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
          ? { id: s.order.customer.id, name: `${s.order.customer.firstName} ${s.order.customer.lastName}` }
          : null,
        // TODO: warrantyExpiry — add to SerialNumber model when expanded
        warrantyExpiry: null as null,
      }))
      .filter(s => {
        if (!q) return true
        return (
          s.serialNumber.toLowerCase().includes(q) ||
          (s.product?.name ?? '').toLowerCase().includes(q) ||
          (s.product?.sku  ?? '').toLowerCase().includes(q) ||
          s.orderNumber.toLowerCase().includes(q)
        )
      })

    return NextResponse.json({ serials: enriched, total: enriched.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
