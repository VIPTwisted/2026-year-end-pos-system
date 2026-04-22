import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (storeId) where.storeId = storeId
  if (status) where.status = status

  const activities = await prisma.warehouseActivity.findMany({
    where,
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(activities)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const year = new Date().getFullYear()
  const prefix = body.type === 'put_away' ? 'PA' : body.type === 'pick' ? 'PK' : 'MV'
  const count = await prisma.warehouseActivity.count({
    where: { activityNo: { startsWith: `${prefix}-${year}-` } },
  })
  const activityNo = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`

  const activity = await prisma.warehouseActivity.create({
    data: {
      activityNo,
      type: body.type,
      storeId: body.storeId,
      receiptId: body.receiptId ?? null,
      shipmentId: body.shipmentId ?? null,
      status: 'open',
      assignedTo: body.assignedTo ?? null,
      lines: body.lines
        ? {
            create: body.lines.map((l: {
              lineNo: number
              actionType: string
              productId: string
              binId?: string
              quantity: number
              unitOfMeasure?: string
              lotNo?: string
              serialNo?: string
            }) => ({
              lineNo: l.lineNo,
              actionType: l.actionType,
              productId: l.productId,
              binId: l.binId ?? null,
              quantity: l.quantity,
              unitOfMeasure: l.unitOfMeasure ?? 'EACH',
              lotNo: l.lotNo ?? null,
              serialNo: l.serialNo ?? null,
            })),
          }
        : undefined,
    },
    include: { _count: { select: { lines: true } } },
  })
  return NextResponse.json(activity, { status: 201 })
}
