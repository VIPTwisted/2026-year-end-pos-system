import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const fromStoreId = searchParams.get('fromStoreId')
  const toStoreId = searchParams.get('toStoreId')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (fromStoreId) where.fromStoreId = fromStoreId
  if (toStoreId) where.toStoreId = toStoreId

  const transfers = await prisma.transferOrder.findMany({
    where,
    include: {
      fromStore: { select: { id: true, name: true } },
      toStore:   { select: { id: true, name: true } },
      _count:    { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(transfers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const year = new Date().getFullYear()
  const count = await prisma.transferOrder.count({
    where: { transferNumber: { startsWith: `TO-${year}-` } },
  })
  const transferNumber = `TO-${year}-${String(count + 1).padStart(4, '0')}`

  const transfer = await prisma.transferOrder.create({
    data: {
      transferNumber,
      fromStoreId: body.fromStoreId || null,
      toStoreId:   body.toStoreId   || null,
      inTransitCode: body.inTransitCode || null,
      status: 'open',
      shipmentDate: body.shipmentDate ? new Date(body.shipmentDate) : null,
      receiptDate:  body.receiptDate  ? new Date(body.receiptDate)  : null,
      notes: body.notes || null,
      lines: body.lines?.length
        ? {
            create: body.lines.map((l: {
              productId?: string
              quantity?: number
              unitOfMeasure?: string
            }) => ({
              productId:     l.productId    || null,
              quantity:      l.quantity      ?? 1,
              unitOfMeasure: l.unitOfMeasure ?? 'EACH',
            })),
          }
        : undefined,
    },
    include: {
      fromStore: { select: { id: true, name: true } },
      toStore:   { select: { id: true, name: true } },
      lines:     { orderBy: { createdAt: 'asc' } },
    },
  })
  return NextResponse.json(transfer, { status: 201 })
}
