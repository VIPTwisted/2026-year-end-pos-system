import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const po = await prisma.vendorPO.findUnique({
      where: { id },
      include: {
        vendor:   true,
        lines:    true,
        receipts: { include: { lines: true } },
      },
    })
    if (!po) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(po)
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
    const { status, expectedDate, shippingAddress, notes } = body

    const po = await prisma.vendorPO.update({
      where: { id },
      data: {
        ...(status          ? { status }                             : {}),
        ...(expectedDate    ? { expectedDate: new Date(expectedDate) } : {}),
        ...(shippingAddress !== undefined ? { shippingAddress }     : {}),
        ...(notes           !== undefined ? { notes }               : {}),
        ...(status === 'received' ? { receivedDate: new Date() }    : {}),
      },
      include: { vendor: true, lines: true, receipts: true },
    })

    return NextResponse.json(po)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const po = await prisma.vendorPO.findUnique({ where: { id }, select: { status: true } })
    if (!po) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (po.status === 'received') {
      return NextResponse.json({ error: 'Cannot delete a received PO' }, { status: 400 })
    }

    await prisma.vendorPO.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
