import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  const invoices = await prisma.vendorInvoice.findMany({
    where: { vendorId: id },
    include: {
      lines: true,
      settlements: {
        include: { payment: true },
      },
    },
    orderBy: { invoiceDate: 'desc' },
  })

  return NextResponse.json(invoices)
}
