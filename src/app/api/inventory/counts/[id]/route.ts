import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const count = await prisma.physicalCount.findUnique({
      where: { id },
      include: {
        store: true,
        lines: {
          include: { product: true },
          orderBy: [
            { countedQty: 'asc' },
            { product: { name: 'asc' } },
          ],
        },
      },
    })

    if (!count) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(count)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as { status?: string; notes?: string }

    const existing = await prisma.physicalCount.findUnique({
      where: { id },
      include: { lines: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updateData: {
      status?: string
      notes?: string
      postedAt?: Date
    } = {}

    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.status) updateData.status = body.status

    // Handle posting
    if (body.status === 'posted' && existing.status !== 'posted') {
      updateData.postedAt = new Date()

      // Apply adjustments for lines with non-zero variance
      const linesToAdjust = existing.lines.filter(
        l => l.countedQty !== null && l.variance !== null && l.variance !== 0,
      )

      for (const line of linesToAdjust) {
        const countedQty = line.countedQty as number
        const systemQty = line.systemQty

        // Update inventory quantity
        await prisma.inventory.updateMany({
          where: { productId: line.productId, storeId: existing.storeId },
          data: { quantity: countedQty },
        })

        // Create inventory transaction
        await prisma.inventoryTransaction.create({
          data: {
            productId: line.productId,
            storeId: existing.storeId,
            type: 'adjustment',
            quantity: line.variance as number,
            beforeQty: systemQty,
            afterQty: countedQty,
            reference: existing.countNumber,
            notes: `Physical count adjustment — ${existing.countNumber}`,
          },
        })
      }
    }

    const updated = await prisma.physicalCount.update({
      where: { id },
      data: updateData,
      include: {
        store: true,
        lines: { include: { product: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
