import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id },
      include: { items: true, order: true },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const invoice = await prisma.salesInvoice.update({
      where: { id },
      data: body,
      include: { items: true },
    })
    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
