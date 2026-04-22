import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status') ?? ''
  const vendorId = searchParams.get('vendorId') ?? ''

  const invoices = await prisma.vpVendorInvoice.findMany({
    where: {
      AND: [
        status   ? { status }   : {},
        vendorId ? { vendorId } : {},
      ],
    },
    include: {
      vendor: { select: { id: true, name: true, vendorNumber: true } },
      po:     { select: { id: true, poNumber: true } },
      lines:  true,
    },
    orderBy: { invoiceDate: 'desc' },
  })

  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.vendorId) {
    return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
  }

  const count = await prisma.vpVendorInvoice.count()
  const invoiceNumber = body.invoiceNumber ?? `INV-${String(count + 1).padStart(6, '0')}`

  const lines: { description: string; qty: number; unitPrice: number }[] = body.lines ?? []
  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
  const tax = body.tax ?? 0
  const total = subtotal + tax

  const invoice = await prisma.vpVendorInvoice.create({
    data: {
      vendorId:      body.vendorId,
      poId:          body.poId ?? null,
      invoiceNumber,
      invoiceDate:   body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
      dueDate:       body.dueDate ? new Date(body.dueDate) : null,
      subtotal,
      tax,
      total,
      status:        'received',
      notes:         body.notes ?? null,
      lines: {
        create: lines.map((l) => ({
          description: l.description,
          qty:         l.qty,
          unitPrice:   l.unitPrice,
          lineTotal:   l.qty * l.unitPrice,
        })),
      },
    },
    include: { lines: true, vendor: true },
  })

  return NextResponse.json(invoice, { status: 201 })
}
