import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const po = await prisma.vpVendorPO.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines:  true,
      invoices: { select: { id: true, invoiceNumber: true, status: true, total: true } },
    },
  })
  if (!po) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(po)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const po = await prisma.vpVendorPO.update({
    where: { id },
    data: {
      status:       body.status,
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : undefined,
      notes:        body.notes,
      ackBy:        body.ackBy,
      ackAt:        body.ackAt ? new Date(body.ackAt) : undefined,
    },
    include: { lines: true },
  })

  return NextResponse.json(po)
}
