import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shipment = await prisma.warehouseShipment.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
      activities: {
        include: { _count: { select: { lines: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(shipment)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  if (body.action === 'post') {
    const shipment = await prisma.warehouseShipment.findUnique({
      where: { id },
      include: { lines: true },
    })
    if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    for (const line of shipment.lines) {
      const qtyToShip = line.qtyToShip > 0 ? line.qtyToShip : line.qtyPicked
      if (qtyToShip <= 0) continue
      await prisma.inventory.updateMany({
        where: { productId: line.productId ?? undefined, storeId: shipment.storeId ?? undefined },
        data: { quantity: { decrement: qtyToShip } },
      })
      await prisma.warehouseShipmentLine.update({
        where: { id: line.id },
        data: { qtyOutstanding: 0 },
      })
    }

    const updated = await prisma.warehouseShipment.update({
      where: { id },
      data: { status: 'posted' },
    })
    return NextResponse.json(updated)
  }

  const updated = await prisma.warehouseShipment.update({
    where: { id },
    data: {
      status: body.status,
      shippingDate: body.shippingDate ? new Date(body.shippingDate) : undefined,
    },
  })
  return NextResponse.json(updated)
}
