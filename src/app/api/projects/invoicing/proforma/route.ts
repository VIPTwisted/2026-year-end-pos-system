import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const invoices = await prisma.proformaInvoice.findMany({
      include: {
        project:  { select: { id: true, projectNo: true, description: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(invoices)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch proforma invoices' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const invoice = await prisma.proformaInvoice.create({ data: body })
    return NextResponse.json(invoice, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create proforma invoice' }, { status: 500 })
  }
}
