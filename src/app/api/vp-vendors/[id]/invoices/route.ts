import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invoices = await prisma.vpVendorInvoice.findMany({
    where: { vendorId: id },
    include: { lines: true, po: true },
    orderBy: { invoiceDate: 'desc' },
  })
  return NextResponse.json(invoices)
}
