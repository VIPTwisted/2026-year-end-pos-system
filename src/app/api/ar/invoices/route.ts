import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  const invoices = await prisma.customerInvoice.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
    },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, invoiceType, invoiceDate, dueDate, lines, notes } = body

  if (!customerId || !lines || lines.length === 0) {
    return NextResponse.json({ error: 'customerId and lines are required' }, { status: 400 })
  }

  const invoiceNumber = `ARINV-${Date.now().toString(36).toUpperCase()}`

  const parsedInvoiceDate = invoiceDate ? new Date(invoiceDate) : new Date()
  const parsedDueDate = dueDate
    ? new Date(dueDate)
    : new Date(parsedInvoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Compute totals from lines
  let subtotal = 0
  let taxAmount = 0
  const processedLines = lines.map((line: {
    description: string
    quantity: number
    unitPrice: number
    taxRate?: number
    productId?: string
    accountCode?: string
  }) => {
    const qty = Number(line.quantity) || 0
    const price = Number(line.unitPrice) || 0
    const taxRate = Number(line.taxRate) || 0
    const lineAmount = qty * price
    const lineTax = lineAmount * (taxRate / 100)
    subtotal += lineAmount
    taxAmount += lineTax
    return {
      description: line.description,
      quantity: qty,
      unitPrice: price,
      lineAmount,
      taxAmount: lineTax,
      ...(line.productId ? { productId: line.productId } : {}),
      ...(line.accountCode ? { accountCode: line.accountCode } : {}),
    }
  })

  const totalAmount = subtotal + taxAmount

  const invoice = await prisma.customerInvoice.create({
    data: {
      invoiceNumber,
      customerId,
      invoiceDate: parsedInvoiceDate,
      dueDate: parsedDueDate,
      postingDate: new Date(),
      invoiceType: invoiceType || 'sales',
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      status: 'draft',
      notes: notes || null,
      lines: {
        create: processedLines,
      },
    },
    include: { customer: true, lines: true },
  })

  return NextResponse.json(invoice, { status: 201 })
}
