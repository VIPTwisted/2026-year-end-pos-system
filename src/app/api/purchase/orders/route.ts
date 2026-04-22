import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search') ?? ''
    const status   = searchParams.get('status') ?? ''
    const vendorId = searchParams.get('vendorId') ?? ''
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo') ?? ''

    type WhereClause = {
      OR?: { poNumber?: { contains: string }; notes?: { contains: string } }[]
      status?: string
      vendorId?: string
      orderDate?: { gte?: Date; lte?: Date }
    }

    const where: WhereClause = {}

    if (search) {
      where.OR = [
        { poNumber: { contains: search } },
        { notes:    { contains: search } },
      ]
    }
    if (status)   where.status   = status
    if (vendorId) where.vendorId = vendorId
    if (dateFrom || dateTo) {
      where.orderDate = {}
      if (dateFrom) where.orderDate.gte = new Date(dateFrom)
      if (dateTo)   where.orderDate.lte = new Date(dateTo)
    }

    const orders = await prisma.vendorPO.findMany({
      where,
      include: {
        vendor: { select: { id: true, vendorCode: true, name: true, paymentTerms: true } },
        lines:    true,
        receipts: { select: { id: true, receiptNumber: true, receivedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    return NextResponse.json(orders)
  } catch (err) {
    console.error('[GET /api/purchase/orders]', err)
    return NextResponse.json({ error: 'Failed to fetch orders', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      vendorId, orderDate, expectedDate, shippingAddress,
      vendorInvoiceNo, purchaser, notes,
      lines = [],
    } = body

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const year   = new Date().getFullYear()
    const prefix = `PO-${year}-`

    const lastPO = await prisma.vendorPO.findFirst({
      where:     { poNumber: { startsWith: prefix } },
      orderBy:   { createdAt: 'desc' },
      select:    { poNumber: true },
    })

    let seq = 1
    if (lastPO) {
      const parts = lastPO.poNumber.split('-')
      const n = parseInt(parts[2] ?? '0', 10)
      if (!isNaN(n)) seq = n + 1
    }
    const poNumber = `${prefix}${String(seq).padStart(4, '0')}`

    type LineInput = {
      productId?:   string
      productName?: string
      sku?:         string
      qtyOrdered:   number
      unitCost:     number
      lineTotal:    number
    }

    const subtotal = (lines as LineInput[]).reduce((s, l) => s + (l.lineTotal ?? 0), 0)

    const allNotes = [
      vendorInvoiceNo ? `Vendor Inv: ${vendorInvoiceNo}` : null,
      purchaser       ? `Purchaser: ${purchaser}`        : null,
      notes           || null,
    ].filter(Boolean).join(' | ') || null

    const po = await prisma.vendorPO.create({
      data: {
        poNumber,
        vendorId,
        status:          'open',
        orderDate:       orderDate ? new Date(orderDate) : new Date(),
        expectedDate:    expectedDate ? new Date(expectedDate) : null,
        shippingAddress: shippingAddress ?? null,
        subtotal,
        totalAmt:        subtotal,
        notes:           allNotes,
        lines: {
          create: (lines as LineInput[]).map(l => ({
            productId:   l.productId   ?? null,
            productName: l.productName ?? null,
            sku:         l.sku         ?? null,
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
    console.error('[POST /api/purchase/orders]', err)
    return NextResponse.json({ error: 'Failed to create order', detail: String(err) }, { status: 500 })
  }
}
