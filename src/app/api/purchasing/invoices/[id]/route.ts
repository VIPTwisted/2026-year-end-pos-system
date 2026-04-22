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
        vendor:      true,
        lines:       true,
        settlements: { include: { payment: true } },
      },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(invoice)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, paidAmount, matchingStatus, poId, notes } = body

    // Validate state transitions
    const current = await prisma.vendorInvoice.findUnique({
      where: { id },
      select: { status: true, totalAmount: true, paidAmount: true },
    })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newPaid = paidAmount !== undefined ? paidAmount : current.paidAmount
    const derivedStatus =
      status ??
      (newPaid <= 0
        ? current.status
        : newPaid >= current.totalAmount
        ? 'paid'
        : 'partial')

    const invoice = await prisma.vendorInvoice.update({
      where: { id },
      data: {
        ...(status          !== undefined ? { status: derivedStatus }      : {}),
        ...(paidAmount      !== undefined ? { paidAmount: newPaid }         : {}),
        ...(matchingStatus  !== undefined ? { matchingStatus }              : {}),
        ...(poId            !== undefined ? { poId }                        : {}),
        ...(notes           !== undefined ? { notes }                       : {}),
      },
      include: { vendor: true, lines: true },
    })

    return NextResponse.json(invoice)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
