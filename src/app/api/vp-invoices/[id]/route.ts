import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invoice = await prisma.vpVendorInvoice.findUnique({
    where: { id },
    include: { vendor: true, po: true, lines: true },
  })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const invoice = await prisma.vpVendorInvoice.update({
    where: { id },
    data: {
      status:        body.status,
      notes:         body.notes,
      disputeReason: body.disputeReason,
    },
    include: { lines: true },
  })

  return NextResponse.json(invoice)
}
