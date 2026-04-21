import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const invoices = await prisma.vendorInvoice.findMany({
    include: { vendor: true },
    orderBy: { invoiceDate: 'desc' },
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { vendorId, invoiceDate, dueDate, postingDate, lines, poId, notes } = body

  if (!vendorId || !invoiceDate || !dueDate || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json(
      { error: 'vendorId, invoiceDate, dueDate, and at least one line are required' },
      { status: 400 }
    )
  }

  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  // Compute totals from lines
  const subtotal = lines.reduce((sum: number, l: { lineAmount?: number; quantity?: number; unitPrice?: number }) => {
    const lineAmount = l.lineAmount ?? (l.quantity ?? 0) * (l.unitPrice ?? 0)
    return sum + lineAmount
  }, 0)

  const taxAmount = lines.reduce((sum: number, l: { taxAmount?: number }) => {
    return sum + (l.taxAmount ?? 0)
  }, 0)

  const totalAmount = subtotal + taxAmount

  // Generate unique invoice number
  const invoiceNumber = `VINV-${Date.now()}`

  const invoice = await prisma.vendorInvoice.create({
    data: {
      invoiceNumber,
      vendorId,
      invoiceDate:    new Date(invoiceDate),
      dueDate:        new Date(dueDate),
      postingDate:    postingDate ? new Date(postingDate) : new Date(),
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount:     0,
      status:         'draft',
      matchingStatus: 'none',
      poId:           poId ?? null,
      notes:          notes ?? null,
      lines: {
        create: lines.map((l: {
          productId?: string
          accountCode?: string
          description: string
          quantity: number
          unitPrice: number
          lineAmount?: number
          taxAmount?: number
        }) => ({
          productId:   l.productId ?? null,
          accountCode: l.accountCode ?? null,
          description: l.description,
          quantity:    l.quantity,
          unitPrice:   l.unitPrice,
          lineAmount:  l.lineAmount ?? l.quantity * l.unitPrice,
          taxAmount:   l.taxAmount ?? 0,
        })),
      },
    },
    include: {
      vendor: true,
      lines:  true,
    },
  })

  return NextResponse.json(invoice, { status: 201 })
}
