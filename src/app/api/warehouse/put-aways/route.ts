import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status    = searchParams.get('status')
  const storeId   = searchParams.get('storeId')
  const sourceId  = searchParams.get('sourceId')

  const where: Record<string, unknown> = {}
  if (status)   where.status   = status
  if (storeId)  where.storeId  = storeId
  if (sourceId) where.sourceId = sourceId

  const putAways = await prisma.warehousePutAway.findMany({
    where,
    include: {
      store:  { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(putAways)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const year  = new Date().getFullYear()
  const count = await prisma.warehousePutAway.count({
    where: { putAwayNo: { startsWith: `PA-${year}-` } },
  })
  const putAwayNo = `PA-${year}-${String(count + 1).padStart(4, '0')}`

  const putAway = await prisma.warehousePutAway.create({
    data: {
      putAwayNo,
      storeId:        body.storeId        || null,
      locationCode:   body.locationCode   || null,
      assignedUserId: body.assignedUserId || null,
      sourceType:     body.sourceType     || null,
      sourceId:       body.sourceId       || null,
      status: 'open',
      lines: body.lines?.length
        ? {
            create: body.lines.map((l: {
              actionType?:  string
              productId?:   string
              description?: string
              quantity?:    number
              unitOfMeasure?: string
              fromZoneCode?: string
              fromBinCode?:  string
              toZoneCode?:   string
              toBinCode?:    string
            }, idx: number) => ({
              lineNo:        idx + 1,
              actionType:    l.actionType    ?? 'Take',
              productId:     l.productId     || null,
              description:   l.description   || null,
              quantity:      l.quantity       ?? 1,
              unitOfMeasure: l.unitOfMeasure  ?? 'EACH',
              fromZoneCode:  l.fromZoneCode   || null,
              fromBinCode:   l.fromBinCode    || null,
              toZoneCode:    l.toZoneCode     || null,
              toBinCode:     l.toBinCode      || null,
            })),
          }
        : undefined,
    },
    include: {
      store:  { select: { id: true, name: true } },
      lines:  { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  })
  return NextResponse.json(putAway, { status: 201 })
}
