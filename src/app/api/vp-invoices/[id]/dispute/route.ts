import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const invoice = await prisma.vpVendorInvoice.update({
    where: { id },
    data: {
      status:        'disputed',
      disputeReason: body.reason ?? null,
    },
  })

  return NextResponse.json(invoice)
}
