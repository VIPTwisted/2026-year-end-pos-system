import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const po = await prisma.vendorPO.findUnique({
      where: { id },
      include: { lines: true },
    })
    if (!po) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 })
    }
    if (['cancelled', 'closed', 'received'].includes(po.status)) {
      return NextResponse.json({ error: `PO is already ${po.status}` }, { status: 400 })
    }

    const receiptLines: Array<{
      poLineId?: string
      productName?: string
      sku?: string
      qtyReceived: number
      condition?: string
      notes?: string
    }> = body.lines || []

    // Create receipt
    const receipt = await prisma.vendorReceipt.create({
      data: {
        poId: id,
        receivedBy: body.receivedBy || null,
        notes: body.notes || null,
        lines: {
          create: receiptLines.map((l) => ({
            poLineId: l.poLineId || null,
            productName: l.productName || null,
            sku: l.sku || null,
            qtyReceived: l.qtyReceived,
            condition: l.condition || 'good',
            notes: l.notes || null,
          })),
        },
      },
      include: { lines: true },
    })

    // Update qtyReceived on each matched PO line
    for (const rl of receiptLines) {
      if (rl.poLineId) {
        const poLine = po.lines.find((l) => l.id === rl.poLineId)
        if (poLine) {
          await prisma.vendorPOLine.update({
            where: { id: rl.poLineId },
            data: {
              qtyReceived: Math.min(
                poLine.qtyOrdered,
                poLine.qtyReceived + rl.qtyReceived
              ),
            },
          })
        }
      }
    }

    // Re-fetch updated lines to determine PO status
    const updatedLines = await prisma.vendorPOLine.findMany({
      where: { poId: id },
    })

    const allFulfilled = updatedLines.every((l) => l.qtyReceived >= l.qtyOrdered)
    const newStatus = allFulfilled ? 'received' : 'partial'

    const updatedPo = await prisma.vendorPO.update({
      where: { id },
      data: {
        status: newStatus,
        receivedDate: allFulfilled ? new Date() : undefined,
      },
    })

    return NextResponse.json({ receipt, po: updatedPo }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to receive shipment' }, { status: 500 })
  }
}
