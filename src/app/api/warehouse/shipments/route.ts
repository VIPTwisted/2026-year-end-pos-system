import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (storeId) where.storeId = storeId
  if (status) where.status = status

  const shipments = await prisma.warehouseShipment.findMany({
    where,
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(shipments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Auto-number WS-YYYY-NNNN
  const year = new Date().getFullYear()
  const count = await prisma.warehouseShipment.count({
    where: { shipmentNo: { startsWith: `WS-${year}-` } },
  })
  const shipmentNo = `WS-${year}-${String(count + 1).padStart(4, '0')}`

  const shipment = await prisma.warehouseShipment.create({
    data: {
      shipmentNo,
      storeId: body.storeId,
      status: 'open',
      sourceType: body.sourceType ?? null,
      sourceId: body.sourceId ?? null,
      shippingDate: body.shippingDate ? new Date(body.shippingDate) : null,
      lines: body.lines
        ? {
            create: body.lines.map((l: {
              productId: string
              qtyOutstanding: number
              unitOfMeasure?: string
              sourceBinId?: string
            }) => ({
              productId: l.productId,
              qtyOutstanding: l.qtyOutstanding,
              qtyToShip: l.qtyOutstanding,
              unitOfMeasure: l.unitOfMeasure ?? 'EACH',
              sourceBinId: l.sourceBinId ?? null,
            })),
          }
        : undefined,
    },
    include: {
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      store: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(shipment, { status: 201 })
}
