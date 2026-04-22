import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.proformaInvoice.findUnique({
      where: { id: params.id },
      include: {
        project:  { select: { id: true, projectNo: true, description: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(invoice)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch proforma invoice' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const invoice = await prisma.proformaInvoice.update({
      where: { id: params.id },
      data:  body,
    })
    return NextResponse.json(invoice)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update proforma invoice' }, { status: 500 })
  }
}
