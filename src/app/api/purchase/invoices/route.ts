import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')   ?? ''
    const status   = searchParams.get('status')   ?? ''
    const vendorId = searchParams.get('vendorId') ?? ''
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo')   ?? ''

    type WhereClause = {
      OR?: { invoiceNumber?: { contains: string }; notes?: { contains: string } }[]
      status?: string
      vendorId?: string
      invoiceDate?: { gte?: Date; lte?: Date }
    }

    const where: WhereClause = {}

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { notes:         { contains: search } },
      ]
    }
    if (status)   where.status   = status
    if (vendorId) where.vendorId = vendorId
    if (dateFrom || dateTo) {
      where.invoiceDate = {}
      if (dateFrom) where.invoiceDate.gte = new Date(dateFrom)
      if (dateTo)   where.invoiceDate.lte = new Date(dateTo)
    }

    const invoices = await prisma.vendorInvoice.findMany({
      where,
      include: {
        vendor: { select: { id: true, vendorCode: true, name: true } },
        lines:  true,
      },
      orderBy: { invoiceDate: 'desc' },
      take: 500,
    })

    return NextResponse.json(invoices)
  } catch (err) {
    console.error('[GET /api/purchase/invoices]', err)
    return NextResponse.json({ error: 'Failed to fetch invoices', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      vendorId, invoiceDate, dueDate, vendorInvoiceNo,
      currency, notes, lines = [],
    } = body

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const year   = new Date().getFullYear()
    const prefix = `PINV-${year}-`

    const last = await prisma.vendorInvoice.findFirst({
      where:   { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceDate: 'desc' },
      select:  { invoiceNumber: true },
    })

    let seq = 1
    if (last) {
      const parts = last.invoiceNumber.split('-')
      const n = parseInt(parts[2] ?? '0', 10)
      if (!isNaN(n)) seq = n + 1
    }
    const invoiceNumber = `${prefix}${String(seq).padStart(4, '0')}`

    type LineInput = { description?: string; qty?: number; unitPrice?: number; amount?: number; glAccountId?: string }

    const totalAmount = (lines as LineInput[]).reduce((s, l) => s + (l.amount ?? 0), 0)

    const invoice = await prisma.vendorInvoice.create({
      data: {
        invoiceNumber,
        vendorId,
        invoiceDate:  invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate:      dueDate     ? new Date(dueDate)     : new Date(),
        postingDate:  new Date(),
        subtotal:     totalAmount,
        totalAmount,
        paidAmount:   0,
        status:       'draft',
        notes:        [vendorInvoiceNo ? `Vendor Inv: ${vendorInvoiceNo}` : null, notes].filter(Boolean).join(' | ') || null,
        lines: {
          create: (lines as LineInput[]).map(l => ({
            description: l.description ?? '',
            quantity:    l.qty         ?? 1,
            unitPrice:   l.unitPrice   ?? 0,
            lineAmount:  l.amount      ?? 0,
            accountCode: l.glAccountId ?? null,
          })),
        },
      },
      include: { vendor: true, lines: true },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (err) {
    console.error('[POST /api/purchase/invoices]', err)
    return NextResponse.json({ error: 'Failed to create invoice', detail: String(err) }, { status: 500 })
  }
}
