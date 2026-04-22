import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const vendorId = sp.get('vendorId') ?? sp.get('supplierId')
    const status   = sp.get('status')

    const bills = await prisma.vendorInvoice.findMany({
      where: {
        ...(vendorId ? { vendorId } : {}),
        ...(status   ? { status }   : {}),
      },
      include: { vendor: true, lines: true },
      orderBy: { invoiceDate: 'desc' },
      take: 300,
    })

    return NextResponse.json(bills)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      vendorId?: string
      supplierId?: string
      billDate?: string
      invoiceDate?: string
      dueDate?: string
      items?: { description: string; qty?: number; quantity?: number; unitPrice: number }[]
      lines?: { description: string; quantity?: number; unitPrice: number; taxAmount?: number; productId?: string; accountCode?: string }[]
      purchaseOrderId?: string
      poId?: string
      notes?: string
    }

    const vendorId    = body.vendorId ?? body.supplierId
    const invoiceDate = body.billDate ?? body.invoiceDate
    const dueDate     = body.dueDate
    const rawLines    = body.items ?? body.lines

    if (!vendorId || !invoiceDate || !dueDate) {
      return NextResponse.json(
        { error: 'vendorId (or supplierId), billDate (or invoiceDate), and dueDate are required' },
        { status: 400 }
      )
    }

    if (!rawLines || !Array.isArray(rawLines) || rawLines.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 })
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const invoiceNumber = `BILL-${Date.now().toString(36).toUpperCase()}`

    let subtotal = 0
    const processedLines = rawLines.map(l => {
      const qty       = Number(('qty' in l ? l.qty : undefined) ?? l.quantity ?? 1)
      const unitPrice = Number(l.unitPrice) || 0
      const lineAmount = qty * unitPrice
      subtotal += lineAmount
      return {
        description: l.description,
        quantity:    qty,
        unitPrice,
        lineAmount,
        taxAmount:   0,
        productId:   ('productId' in l ? l.productId : undefined) ?? null,
        accountCode: ('accountCode' in l ? l.accountCode : undefined) ?? null,
      }
    })

    const bill = await prisma.vendorInvoice.create({
      data: {
        invoiceNumber,
        vendorId,
        invoiceDate:  new Date(invoiceDate),
        dueDate:      new Date(dueDate),
        postingDate:  new Date(),
        subtotal,
        taxAmount:    0,
        totalAmount:  subtotal,
        paidAmount:   0,
        status:       'draft',
        matchingStatus: 'none',
        poId:         body.purchaseOrderId ?? body.poId ?? null,
        notes:        body.notes ?? null,
        lines:        { create: processedLines },
      },
      include: { vendor: true, lines: true },
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
