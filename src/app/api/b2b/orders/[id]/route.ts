import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.b2BOrder.findUnique({
      where: { id },
      include: {
        account: true,
        lines: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const order = await prisma.b2BOrder.update({
      where: { id },
      data: {
        status: body.status,
        requestedDate: body.requestedDate ? new Date(body.requestedDate) : undefined,
        poReference: body.poReference,
        notes: body.notes,
        discountAmt: body.discountAmt !== undefined ? Number(body.discountAmt) : undefined,
        taxAmt: body.taxAmt !== undefined ? Number(body.taxAmt) : undefined,
      },
    })

    return NextResponse.json(order)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
