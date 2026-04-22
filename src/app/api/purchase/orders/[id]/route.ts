import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.vendorPO.findUnique({
      where: { id },
      include: {
        vendor: true,
        lines:  true,
        receipts: { include: { lines: true } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch (err) {
    console.error('[GET /api/purchase/orders/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch order', detail: String(err) }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }  = await params
    const body    = await req.json()
    const { status, expectedDate, shippingAddress, notes, taxAmt, shippingAmt } = body

    const existing = await prisma.vendorPO.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.vendorPO.update({
      where: { id },
      data: {
        ...(status          !== undefined ? { status }          : {}),
        ...(expectedDate    !== undefined ? { expectedDate:    expectedDate ? new Date(expectedDate) : null } : {}),
        ...(shippingAddress !== undefined ? { shippingAddress } : {}),
        ...(notes           !== undefined ? { notes }           : {}),
        ...(taxAmt          !== undefined ? { taxAmt }          : {}),
        ...(shippingAmt     !== undefined ? { shippingAmt }     : {}),
        ...(status === 'received'         ? { receivedDate: new Date() } : {}),
      },
      include: { vendor: true, lines: true, receipts: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/purchase/orders/[id]]', err)
    return NextResponse.json({ error: 'Failed to update order', detail: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.vendorPO.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!['draft', 'open'].includes(existing.status)) {
      return NextResponse.json({ error: 'Cannot delete a released or received order' }, { status: 422 })
    }
    await prisma.vendorPO.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/purchase/orders/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete order', detail: String(err) }, { status: 500 })
  }
}
