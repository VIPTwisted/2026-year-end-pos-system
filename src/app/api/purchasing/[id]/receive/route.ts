import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { lines, notes, receivedBy } = body as {
    lines: { poItemId: string; quantityReceived: number }[]
    notes?: string
    receivedBy?: string
  }

  if (!lines || lines.length === 0) {
    return NextResponse.json({ error: 'lines are required' }, { status: 400 })
  }

  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!po) {
    return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
  }

  if (['received', 'cancelled'].includes(po.status)) {
    return NextResponse.json(
      { error: `Cannot receive against a PO with status "${po.status}"` },
      { status: 400 }
    )
  }

  // Generate receipt number
  const year = new Date().getFullYear()
  const lastReceipt = await prisma.purchaseReceipt.findFirst({
    where: { receiptNumber: { startsWith: `REC-${year}-` } },
    orderBy: { receivedAt: 'desc' },
  })
  let seq = 1
  if (lastReceipt) {
    const parts = lastReceipt.receiptNumber.split('-')
    const n = parseInt(parts[2] ?? '0', 10)
    if (!isNaN(n)) seq = n + 1
  }
  const receiptNumber = `REC-${year}-${String(seq).padStart(3, '0')}`

  // Filter out zero-qty lines
  const validLines = lines.filter(l => Number(l.quantityReceived) > 0)
  if (validLines.length === 0) {
    return NextResponse.json({ error: 'No quantities entered' }, { status: 400 })
  }

  // Create receipt + lines in a transaction, then update item receivedQty
  const receipt = await prisma.$transaction(async tx => {
    const rec = await tx.purchaseReceipt.create({
      data: {
        receiptNumber,
        purchaseOrderId: id,
        receivedBy: receivedBy || null,
        notes: notes || null,
        lines: {
          create: validLines.map(l => ({
            poItemId: l.poItemId,
            quantityReceived: Number(l.quantityReceived),
          })),
        },
      },
      include: { lines: true },
    })

    // Update receivedQty on each item
    for (const l of validLines) {
      const item = po.items.find(i => i.id === l.poItemId)
      if (!item) continue
      const newReceived = item.receivedQty + Number(l.quantityReceived)
      await tx.purchaseOrderItem.update({
        where: { id: l.poItemId },
        data: { receivedQty: newReceived },
      })
    }

    // Re-fetch items to determine PO status
    const updatedItems = await tx.purchaseOrderItem.findMany({
      where: { poId: id },
    })

    const allReceived = updatedItems.every(i => i.receivedQty >= i.orderedQty)
    const anyReceived = updatedItems.some(i => i.receivedQty > 0)
    const newStatus = allReceived ? 'received' : anyReceived ? 'partial' : po.status

    await tx.purchaseOrder.update({
      where: { id },
      data: {
        status: newStatus,
        ...(allReceived ? { receivedDate: new Date() } : {}),
      },
    })

    return rec
  })

  return NextResponse.json(receipt, { status: 201 })
}
