import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status    = searchParams.get('status')
    const vendorId  = searchParams.get('vendorId')

    const orders = await prisma.vendorPO.findMany({
      where: {
        ...(status   ? { status }   : {}),
        ...(vendorId ? { vendorId } : {}),
      },
      include: {
        vendor: { select: { id: true, vendorCode: true, name: true, paymentTerms: true } },
        lines:    true,
        receipts: { include: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    return NextResponse.json(orders)
  } catch (err) {
    console.error('[GET /api/purchasing/orders]', err)
    return NextResponse.json({ error: 'Failed to fetch orders', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      vendorId, orderDate, expectedDate, shipToLocation,
      vendorInvoiceNo, purchaser, notes, isQuote,
      lines = [],
    } = body

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }
    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 })
    }

    const year = new Date().getFullYear()
    const prefix = isQuote ? `PQ-${year}-` : `PO-${year}-`

    const lastPO = await prisma.vendorPO.findFirst({
      where: { poNumber: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
      select: { poNumber: true },
    })

    let seq = 1
    if (lastPO) {
      const parts = lastPO.poNumber.split('-')
      const n = parseInt(parts[2] ?? '0', 10)
      if (!isNaN(n)) seq = n + 1
    }
    const poNumber = `${prefix}${String(seq).padStart(4, '0')}`

    type LineInput = {
      productName?: string
      productId?: string
      sku?: string
      qtyOrdered: number
      unitCost: number
      lineTotal: number
    }

    const subtotal = (lines as LineInput[]).reduce((s, l) => s + (l.lineTotal ?? 0), 0)

    const po = await prisma.vendorPO.create({
      data: {
        poNumber,
        vendorId,
        status:          isQuote ? 'draft' : 'open',
        orderDate:       orderDate ? new Date(orderDate) : new Date(),
        expectedDate:    expectedDate ? new Date(expectedDate) : null,
        shippingAddress: shipToLocation ?? null,
        subtotal,
        totalAmt: subtotal,
        notes: [vendorInvoiceNo ? `Vendor Inv: ${vendorInvoiceNo}` : null, purchaser ? `Purchaser: ${purchaser}` : null, notes]
          .filter(Boolean)
          .join(' | ') || null,
        lines: {
          create: (lines as LineInput[]).map(l => ({
            productId:   l.productId ?? null,
            productName: l.productName ?? null,
            sku:         l.sku ?? null,
            qtyOrdered:  l.qtyOrdered,
            qtyReceived: 0,
            unitCost:    l.unitCost,
            lineTotal:   l.lineTotal,
          })),
        },
      },
      include: { vendor: true, lines: true },
    })

    return NextResponse.json(po, { status: 201 })
  } catch (err) {
    console.error('[POST /api/purchasing/orders]', err)
    return NextResponse.json({ error: 'Failed to create order', detail: String(err) }, { status: 500 })
  }
}
