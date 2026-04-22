import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: shipmentId } = await params

  const shipment = await prisma.warehouseShipment.findUnique({
    where: { id: shipmentId },
    include: { lines: { include: { product: true } } },
  })
  if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (shipment.status === 'posted') {
    return NextResponse.json({ error: 'Shipment already posted' }, { status: 400 })
  }

  const storeId = shipment.storeId ?? undefined

  // Find SHIP type bin for destination
  const shipBin = await prisma.warehouseBin.findFirst({
    where: { storeId, binType: 'SHIP', isBlocked: false },
  })

  // Auto-number
  const year = new Date().getFullYear()
  const count = await prisma.warehouseActivity.count({
    where: { activityNo: { startsWith: `PK-${year}-` } },
  })
  const activityNo = `PK-${year}-${String(count + 1).padStart(4, '0')}`

  const lines: {
    lineNo: number
    actionType: string
    productId: string | undefined
    binId: string | null
    quantity: number
    unitOfMeasure: string
  }[] = []

  let lineNo = 1
  for (const shipLine of shipment.lines) {
    const qty = shipLine.qtyToShip > 0 ? shipLine.qtyToShip : shipLine.qtyOutstanding

    // Find best pick bin for this product (has content)
    const binContent = await prisma.warehouseBinContent.findFirst({
      where: {
        productId: shipLine.productId ?? undefined,
        bin: { storeId, isBlocked: false, binType: { in: ['PICK', 'PUTPICK'] } },
        quantity: { gte: qty },
      },
      include: { bin: true },
      orderBy: { bin: { rankNo: 'asc' } },
    })

    const sourceBinId = shipLine.sourceBinId ?? binContent?.binId ?? null

    // TAKE from pick bin
    lines.push({
      lineNo: lineNo++,
      actionType: 'take',
      productId: shipLine.productId ?? undefined,
      binId: sourceBinId,
      quantity: qty,
      unitOfMeasure: shipLine.unitOfMeasure,
    })

    // PLACE to ship bin
    lines.push({
      lineNo: lineNo++,
      actionType: 'place',
      productId: shipLine.productId ?? undefined,
      binId: shipBin?.id ?? null,
      quantity: qty,
      unitOfMeasure: shipLine.unitOfMeasure,
    })
  }

  const activity = await prisma.warehouseActivity.create({
    data: {
      activityNo,
      type: 'pick',
      storeId: storeId ?? undefined,
      shipmentId,
      status: 'open',
      lines: { create: lines },
    },
    include: {
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          bin: { select: { id: true, code: true } },
        },
      },
    },
  })

  return NextResponse.json(activity, { status: 201 })
}
