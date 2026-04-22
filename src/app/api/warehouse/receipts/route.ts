import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (storeId) where.storeId = storeId
  if (status) where.status = status

  const receipts = await prisma.warehouseReceipt.findMany({
    where,
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(receipts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Auto-number WR-YYYY-NNNN
  const year = new Date().getFullYear()
  const count = await prisma.warehouseReceipt.count({
    where: { receiptNo: { startsWith: `WR-${year}-` } },
  })
  const receiptNo = `WR-${year}-${String(count + 1).padStart(4, '0')}`

  const receipt = await prisma.warehouseReceipt.create({
    data: {
      receiptNo,
      storeId: body.storeId,
      status: 'open',
      sourceType: body.sourceType ?? null,
      sourceId: body.sourceId ?? null,
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
      lines: body.lines
        ? {
            create: body.lines.map((l: {
              productId: string
              qtyExpected: number
              unitOfMeasure?: string
              lotNo?: string
              serialNo?: string
              destinationBinId?: string
            }) => ({
              productId: l.productId,
              qtyExpected: l.qtyExpected,
              qtyToReceive: l.qtyExpected,
              unitOfMeasure: l.unitOfMeasure ?? 'EACH',
              lotNo: l.lotNo ?? null,
              serialNo: l.serialNo ?? null,
              destinationBinId: l.destinationBinId ?? null,
            })),
          }
        : undefined,
    },
    include: {
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      store: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(receipt, { status: 201 })
}
