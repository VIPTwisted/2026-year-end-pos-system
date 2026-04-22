import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (storeId) where.storeId = storeId
  if (status) where.status = status

  const picks = await prisma.warehousePick.findMany({
    where,
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(picks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { storeId, locationCode, assignedUserId, sourceType, sourceId, lines = [] } = body

  const year = new Date().getFullYear()
  const count = await prisma.warehousePick.count({
    where: { pickNo: { startsWith: `WP-${year}-` } },
  })
  const pickNo = `WP-${year}-${String(count + 1).padStart(5, '0')}`

  const pick = await prisma.warehousePick.create({
    data: {
      pickNo,
      storeId: storeId || null,
      locationCode: locationCode || null,
      assignedUserId: assignedUserId || null,
      sourceType: sourceType || null,
      sourceId: sourceId || null,
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

  return NextResponse.json(pick, { status: 201 })
}
