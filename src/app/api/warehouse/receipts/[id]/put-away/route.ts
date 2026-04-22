import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: receiptId } = await params

  const receipt = await prisma.warehouseReceipt.findUnique({
    where: { id: receiptId },
    include: {
      lines: { include: { product: true } },
      store: true,
    },
  })
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (receipt.status === 'posted') {
    return NextResponse.json({ error: 'Receipt already posted' }, { status: 400 })
  }

  // Find or use destination bins
  const storeId = receipt.storeId

  // Get RECEIVE type bin (source) — first one available
  const receiveBin = await prisma.warehouseBin.findFirst({
    where: { storeId: storeId ?? undefined, binType: 'RECEIVE', isBlocked: false },
  })

  // Get PUTPICK bins for destinations
  const putpickBins = await prisma.warehouseBin.findMany({
    where: { storeId: storeId ?? undefined, binType: { in: ['PUTPICK', 'PUTAWAY'] }, isBlocked: false },
    orderBy: [{ rankNo: 'asc' }, { code: 'asc' }],
  })

  // Auto-number
  const year = new Date().getFullYear()
  const count = await prisma.warehouseActivity.count({
    where: { activityNo: { startsWith: `PA-${year}-` } },
  })
  const activityNo = `PA-${year}-${String(count + 1).padStart(4, '0')}`

  // Build take/place line pairs
  const lines: {
    lineNo: number
    actionType: string
    productId: string | undefined
    binId: string | null
    quantity: number
    unitOfMeasure: string
    lotNo: string | null
    serialNo: string | null
  }[] = []

  let lineNo = 1
  for (let i = 0; i < receipt.lines.length; i++) {
    const receiptLine = receipt.lines[i]
    const qty = receiptLine.qtyToReceive > 0 ? receiptLine.qtyToReceive : receiptLine.qtyExpected

    // TAKE line from RECEIVE bin (or null if no receive bin)
    lines.push({
      lineNo: lineNo++,
      actionType: 'take',
      productId: receiptLine.productId ?? undefined,
      binId: receiveBin?.id ?? null,
      quantity: qty,
      unitOfMeasure: receiptLine.unitOfMeasure,
      lotNo: receiptLine.lotNo ?? null,
      serialNo: receiptLine.serialNo ?? null,
    })

    // PLACE line — use destinationBinId from receipt line, or pick from putpickBins
    const destBin = receiptLine.destinationBinId
      ? { id: receiptLine.destinationBinId }
      : (putpickBins[i % putpickBins.length] ?? null)

    lines.push({
      lineNo: lineNo++,
      actionType: 'place',
      productId: receiptLine.productId ?? undefined,
      binId: destBin?.id ?? null,
      quantity: qty,
      unitOfMeasure: receiptLine.unitOfMeasure,
      lotNo: receiptLine.lotNo ?? null,
      serialNo: receiptLine.serialNo ?? null,
    })
  }

  const activity = await prisma.warehouseActivity.create({
    data: {
      activityNo,
      type: 'put_away',
      storeId: storeId ?? undefined,
      receiptId,
      status: 'open',
      lines: {
        create: lines,
      },
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
