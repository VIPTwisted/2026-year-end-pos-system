import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.vpVendorInvoice.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const newPaid = (existing.paidAmount ?? 0) + (body.amount ?? 0)
  const isPaid = newPaid >= existing.total

  const invoice = await prisma.vpVendorInvoice.update({
    where: { id },
    data: {
      paidAmount:    newPaid,
      status:        isPaid ? 'paid' : 'partial-paid',
      paymentMethod: body.method ?? null,
      paymentRef:    body.ref ?? null,
      paidAt:        isPaid ? new Date() : existing.paidAt,
    },
  })

  return NextResponse.json(invoice)
}
