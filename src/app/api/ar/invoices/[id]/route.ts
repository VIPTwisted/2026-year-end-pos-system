import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: true,
      settlements: {
        orderBy: { settledAt: 'desc' },
      },
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  return NextResponse.json(invoice)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, notes, paidAmount } = body

  const existing = await prisma.customerInvoice.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const invoice = await prisma.customerInvoice.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(paidAmount !== undefined ? { paidAmount } : {}),
    },
    include: { customer: true, lines: true, settlements: true },
  })

  return NextResponse.json(invoice)
}
