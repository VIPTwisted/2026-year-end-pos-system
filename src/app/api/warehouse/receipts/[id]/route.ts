import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const receipt = await prisma.warehouseReceipt.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
      },
      activities: {
        include: { _count: { select: { lines: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(receipt)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // If action=post, update inventory and mark posted
  if (body.action === 'post') {
    const receipt = await prisma.warehouseReceipt.findUnique({
      where: { id },
      include: { lines: true },
    })
    if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Update inventory for each line
    for (const line of receipt.lines) {
      const qtyToAdd = line.qtyToReceive > 0 ? line.qtyToReceive : line.qtyExpected - line.qtyReceived
      if (qtyToAdd <= 0) continue

      await prisma.inventory.upsert({
        where: { productId_storeId: { productId: line.productId ?? '', storeId: receipt.storeId ?? '' } },
        create: { productId: line.productId ?? '', storeId: receipt.storeId ?? '', quantity: qtyToAdd },
        update: { quantity: { increment: qtyToAdd } },
      })

      await prisma.warehouseReceiptLine.update({
        where: { id: line.id },
        data: {
          qtyReceived: { increment: qtyToAdd },
          qtyToReceive: 0,
        },
      })
    }

    const updated = await prisma.warehouseReceipt.update({
      where: { id },
      data: { status: 'posted' },
    })
    return NextResponse.json(updated)
  }

  // General patch
  const updated = await prisma.warehouseReceipt.update({
    where: { id },
    data: {
      status: body.status,
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : undefined,
    },
  })
  return NextResponse.json(updated)
}
