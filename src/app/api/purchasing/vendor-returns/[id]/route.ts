import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vendorReturn = await prisma.vendorReturn.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    })

    if (!vendorReturn) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(vendorReturn)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      status?: string
      creditAmount?: number
      notes?: string
    }

    const existing = await prisma.vendorReturn.findUnique({
      where: { id },
      include: { lines: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Get the default store for inventory operations
    const defaultStore = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } })

    if (body.status === 'approved' && existing.status === 'draft') {
      // Deduct inventory for each line and create inventory transactions
      if (defaultStore) {
        for (const line of existing.lines) {
          const inv = await prisma.inventory.findUnique({
            where: { productId_storeId: { productId: line.productId, storeId: defaultStore.id } },
          })

          const beforeQty = inv?.quantity ?? 0
          const afterQty = Math.max(0, beforeQty - line.quantity)

          if (inv) {
            await prisma.inventory.update({
              where: { productId_storeId: { productId: line.productId, storeId: defaultStore.id } },
              data: { quantity: afterQty },
            })
          }

          await prisma.inventoryTransaction.create({
            data: {
              productId: line.productId,
              storeId: defaultStore.id,
              type: 'return',
              quantity: -line.quantity,
              beforeQty,
              afterQty,
              reference: existing.rtvNumber,
              notes: `RTV approved: ${existing.reason}`,
            },
          })
        }
      }
    }

    const updateData: {
      status?: string
      creditAmount?: number
      notes?: string
      shippedAt?: Date
      creditedAt?: Date
    } = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.creditAmount !== undefined) updateData.creditAmount = body.creditAmount
    if (body.notes !== undefined) updateData.notes = body.notes

    if (body.status === 'shipped') updateData.shippedAt = new Date()
    if (body.status === 'credited') updateData.creditedAt = new Date()

    const updated = await prisma.vendorReturn.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        lines: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
