import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await prisma.vendorInvoice.findUnique({
      where: { id },
      include: {
        vendor: true,
        lines:  true,
        settlements: {
          include: { payment: true },
        },
      },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(invoice)
  } catch (err) {
    console.error('[GET /api/purchase/invoices/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch invoice', detail: String(err) }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }  = await params
    const body    = await req.json()
    const { status, dueDate, notes, paidAmount } = body

    const existing = await prisma.vendorInvoice.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.vendorInvoice.update({
      where: { id },
      data: {
        ...(status     !== undefined ? { status }     : {}),
        ...(dueDate    !== undefined ? { dueDate: dueDate ? new Date(dueDate) : undefined } : {}),
        ...(notes      !== undefined ? { notes }      : {}),
        ...(paidAmount !== undefined ? { paidAmount } : {}),
      },
      include: { vendor: true, lines: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/purchase/invoices/[id]]', err)
    return NextResponse.json({ error: 'Failed to update invoice', detail: String(err) }, { status: 500 })
  }
}
