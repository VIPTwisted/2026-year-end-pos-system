import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: activityId } = await params
  const body = await req.json() // optional: { lineUpdates: [{lineId, qtyHandled}] }

  const activity = await prisma.warehouseActivity.findUnique({
    where: { id: activityId },
    include: { lines: { include: { bin: true } } },
  })
  if (!activity) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (activity.status === 'completed') {
    return NextResponse.json({ error: 'Activity already completed' }, { status: 400 })
  }

  // Apply line updates if provided
  const lineUpdates: Record<string, number> = {}
  if (body.lineUpdates) {
    for (const u of body.lineUpdates as { lineId: string; qtyHandled: number }[]) {
      lineUpdates[u.lineId] = u.qtyHandled
    }
  }

  // Process pairs: take lines remove from source bin, place lines add to dest bin
  const takeLines = activity.lines.filter((l) => l.actionType === 'take')
  const placeLines = activity.lines.filter((l) => l.actionType === 'place')

  for (const takeLine of takeLines) {
    const qtyHandled = lineUpdates[takeLine.id] ?? takeLine.quantity
    if (takeLine.binId && qtyHandled > 0) {
      // Remove from source bin content — findFirst (no binId_productId compound unique)
      const existing = await prisma.warehouseBinContent.findFirst({
        where: { binId: takeLine.binId, productId: takeLine.productId ?? undefined },
      })
      if (existing) {
        const newQty = Math.max(0, existing.quantity - qtyHandled)
        await prisma.warehouseBinContent.update({
          where: { id: existing.id },
          data: { quantity: newQty, lastUpdated: new Date() },
        })
        // Update bin isEmpty
        await prisma.warehouseBin.update({
          where: { id: takeLine.binId },
          data: { isEmpty: newQty <= 0 },
        })
      }
    }
    await prisma.warehouseActivityLine.update({
      where: { id: takeLine.id },
      data: { qtyHandled, isHandled: true },
    })
  }

  for (const placeLine of placeLines) {
    const qtyHandled = lineUpdates[placeLine.id] ?? placeLine.quantity
    if (placeLine.binId && qtyHandled > 0) {
      const existing = await prisma.warehouseBinContent.findFirst({
        where: { binId: placeLine.binId, productId: placeLine.productId ?? undefined },
      })
      if (existing) {
        await prisma.warehouseBinContent.update({
          where: { id: existing.id },
          data: { quantity: { increment: qtyHandled }, lastUpdated: new Date() },
        })
      } else {
        await prisma.warehouseBinContent.create({
          data: {
            binId: placeLine.binId,
            productId: placeLine.productId ?? '',
            quantity: qtyHandled,
            lotNo: placeLine.lotNo ?? null,
            serialNo: placeLine.serialNo ?? null,
          },
        })
      }
      await prisma.warehouseBin.update({
        where: { id: placeLine.binId },
        data: { isEmpty: false },
      })
    }
    await prisma.warehouseActivityLine.update({
      where: { id: placeLine.id },
      data: { qtyHandled, isHandled: true },
    })
  }

  // If shipment, update picked qty
  if (activity.shipmentId) {
    const totalPicked = placeLines.reduce(
      (sum, l) => sum + (lineUpdates[l.id] ?? l.quantity),
      0
    )
    await prisma.warehouseShipment.update({
      where: { id: activity.shipmentId },
      data: { status: 'partially_picked' },
    })
    // Update shipment lines picked qty
    for (const placeLine of placeLines) {
      const qty = lineUpdates[placeLine.id] ?? placeLine.quantity
      if (qty > 0) {
        await prisma.warehouseShipmentLine.updateMany({
          where: { shipmentId: activity.shipmentId, productId: placeLine.productId ?? undefined },
          data: { qtyPicked: { increment: qty } },
        })
      }
    }
    void totalPicked // suppress unused warning
  }

  const updated = await prisma.warehouseActivity.update({
    where: { id: activityId },
    data: { status: 'completed' },
    include: {
      lines: {
        include: {
          product: { select: { id: true, name: true } },
          bin: { select: { id: true, code: true } },
        },
        orderBy: { lineNo: 'asc' },
      },
    },
  })

  return NextResponse.json(updated)
}
