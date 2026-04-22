import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const po = await prisma.vendorPO.findUnique({
      where: { id },
      include: {
        vendor: true,
        lines: { orderBy: { createdAt: 'asc' } },
        receipts: {
          include: { lines: true },
          orderBy: { receivedAt: 'desc' },
        },
      },
    })

    if (!po) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 })
    }

    return NextResponse.json(po)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch PO' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.vendorPO.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 })
    }

    const po = await prisma.vendorPO.update({
      where: { id },
      data: {
        status: body.status ?? undefined,
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : undefined,
        shippingAddress: body.shippingAddress ?? undefined,
        notes: body.notes ?? undefined,
      },
    })

    return NextResponse.json(po)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update PO' }, { status: 500 })
  }
}
