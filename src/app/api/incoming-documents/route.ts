// Incoming Documents — backed by VendorInvoice model
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const where: {
    status?: string
    invoiceDate?: { gte?: Date; lte?: Date }
  } = {}

  if (status && status !== 'all') where.status = status
  if (from || to) {
    where.invoiceDate = {}
    if (from) where.invoiceDate.gte = new Date(from)
    if (to) where.invoiceDate.lte = new Date(to)
  }

  const invoices = await prisma.vendorInvoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      vendor: { select: { id: true, name: true } },
      lines: { select: { id: true } },
    },
  })

  return NextResponse.json(invoices)
}

export async function POST(req: Request) {
  const body = await req.json()
  const invoice = await prisma.vendorInvoice.create({
    data: {
      invoiceNumber: body.invoiceNumber,
      vendorId: body.vendorId,
      invoiceDate: new Date(body.invoiceDate),
      dueDate: new Date(body.dueDate),
      subtotal: body.subtotal ?? 0,
      taxAmount: body.taxAmount ?? 0,
      totalAmount: body.totalAmount ?? 0,
      status: body.status ?? 'draft',
      notes: body.notes ?? null,
    },
    include: {
      vendor: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(invoice, { status: 201 })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { ids, status } = body as { ids: string[]; status: string }
  // Bulk status update (e.g., bulk approve)
  await prisma.vendorInvoice.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
  return NextResponse.json({ updated: ids.length })
}
