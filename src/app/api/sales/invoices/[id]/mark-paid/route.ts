import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const inv = await prisma.salesInvoice.findUnique({ where: { id } })
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const invoice = await prisma.salesInvoice.update({
      where: { id },
      data: { status: 'paid', paidAmount: inv.totalAmount },
    })
    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark invoice as paid' }, { status: 500 })
  }
}
