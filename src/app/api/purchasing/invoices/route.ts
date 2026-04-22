import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status   = searchParams.get('status')
    const vendorId = searchParams.get('vendorId')

    const invoices = await prisma.vendorInvoice.findMany({
      where: {
        ...(status   ? { status }   : {}),
        ...(vendorId ? { vendorId } : {}),
      },
      include: {
        vendor: { select: { id: true, vendorCode: true, name: true } },
        lines:  true,
      },
      orderBy: { invoiceDate: 'desc' },
      take: 500,
    })

    return NextResponse.json(invoices)
  } catch (err) {
    console.error('[GET /api/purchasing/invoices]', err)
    return NextResponse.json({ error: 'Failed to fetch invoices', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      vendorId, invoiceDate, dueDate, postingDate,
      vendorInvoiceNo, notes, subtotal, taxAmount, totalAmount,
      poId,
      lines = [],
    } = body

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const year = new Date().getFullYear()
    const lastInv = await prisma.vendorInvoice.findFirst({
      where: { invoiceNumber: { startsWith: `PINV-${year}-` } },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    })
    let seq = 1
    if (lastInv) {
      const parts = lastInv.invoiceNumber.split('-')
      const n = parseInt(parts[2] ?? '0', 10)
      if (!isNaN(n)) seq = n + 1
    }
    const invoiceNumber = `PINV-${year}-${String(seq).padStart(4, '0')}`

    type LineInput = {
      productId?: string
      accountCode?: string
      description: string
      quantity?: number
      unitPrice: number
      taxAmount?: number
      lineAmount: number
    }

    const invoice = await prisma.vendorInvoice.create({
      data: {
        invoiceNumber,
        vendorId,
        invoiceDate:  invoiceDate  ? new Date(invoiceDate)  : new Date(),
        dueDate:      dueDate      ? new Date(dueDate)      : new Date(),
        postingDate:  postingDate  ? new Date(postingDate)  : new Date(),
        subtotal:     subtotal     ?? totalAmount ?? 0,
        taxAmount:    taxAmount    ?? 0,
        totalAmount:  totalAmount  ?? subtotal ?? 0,
        paidAmount:   0,
        status:       'draft',
        matchingStatus: 'none',
        poId:         poId ?? null,
        notes:        [vendorInvoiceNo ? `Vendor Inv#: ${vendorInvoiceNo}` : null, notes]
          .filter(Boolean).join(' | ') || null,
        lines: {
          create: (lines as LineInput[]).map(l => ({
            productId:   l.productId   ?? null,
            accountCode: l.accountCode ?? null,
            description: l.description,
            quantity:    l.quantity    ?? 1,
            unitPrice:   l.unitPrice,
            lineAmount:  l.lineAmount,
            taxAmount:   l.taxAmount   ?? 0,
          })),
        },
      },
      include: { vendor: true, lines: true },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (err) {
    console.error('[POST /api/purchasing/invoices]', err)
    return NextResponse.json({ error: 'Failed to create invoice', detail: String(err) }, { status: 500 })
  }
}
