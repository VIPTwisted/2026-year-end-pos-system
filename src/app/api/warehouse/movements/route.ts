import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (storeId) where.storeId = storeId
  if (status) where.status = status

  const movements = await prisma.warehouseMovement.findMany({
    where,
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(movements)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { storeId, locationCode, assignedUserId, description, lines = [] } = body

  const year = new Date().getFullYear()
  const count = await prisma.warehouseMovement.count({
    where: { movementNo: { startsWith: `WM-${year}-` } },
  })
  const movementNo = `WM-${year}-${String(count + 1).padStart(5, '0')}`

  const movement = await prisma.warehouseMovement.create({
    data: {
      movementNo,
      storeId: storeId || null,
      locationCode: locationCode || null,
      assignedUserId: assignedUserId || null,
      description: description || null,
      lines: {
        create: lines.map((l: Record<string, unknown>, i: number) => ({
          lineNo: (i + 1) * 10000,
          actionType: l.actionType ?? 'Take',
          productId: l.productId || null,
          description: l.description || null,
          unitOfMeasure: l.unitOfMeasure ?? 'EACH',
          quantity: Number(l.quantity ?? 0),
          fromZoneCode: l.fromZoneCode || null,
          fromBinCode: l.fromBinCode || null,
          toZoneCode: l.toZoneCode || null,
          toBinCode: l.toBinCode || null,
          lotNo: l.lotNo || null,
          serialNo: l.serialNo || null,
        })),
      },
    },
    include: { lines: true },
  })

  return NextResponse.json(movement, { status: 201 })
}
