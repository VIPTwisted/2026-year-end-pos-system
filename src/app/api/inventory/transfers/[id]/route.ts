import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const order = await prisma.transferOrder.findUnique({
      where: { id },
      include: {
        fromStore: { select: { id: true, name: true, city: true, state: true } },
        toStore: { select: { id: true, name: true, city: true, state: true } },
        lines: {
          include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
        },
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(order)
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
    const body = await req.json() as {
      status?: string
      lines?: { id: string; quantityShipped?: number; quantityReceived?: number }[]
      notes?: string
      shipmentDate?: string
      receiptDate?: string
    }

    const order = await prisma.transferOrder.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const TRANSITIONS: Record<string, string[]> = {
      open: ['released'],
      released: ['shipped', 'open'],
      shipped: ['received'],
      received: ['closed'],
      closed: [],
    }

    if (body.status && !TRANSITIONS[order.status]?.includes(body.status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${body.status}` },
        { status: 400 },
      )
    }

    // Update line quantities if provided
    if (body.lines && Array.isArray(body.lines)) {
      for (const l of body.lines) {
        await prisma.transferLine.update({
          where: { id: l.id },
          data: {
            ...(l.quantityShipped !== undefined ? { quantityShipped: l.quantityShipped } : {}),
            ...(l.quantityReceived !== undefined ? { quantityReceived: l.quantityReceived } : {}),
          },
        })
      }
    }

    // When transitioning to 'received': adjust inventory for each line
    if (body.status === 'received') {
      // Reload lines with latest quantities
      const freshLines = await prisma.transferLine.findMany({ where: { orderId: id } })

      for (const line of freshLines) {
        const qty = line.quantityShipped > 0 ? line.quantityShipped : line.quantity

        // Deduct from fromStore
        const fromInv = await prisma.inventory.findUnique({
          where: { productId_storeId: { productId: line.productId, storeId: order.fromStoreId } },
        })
        const fromBefore = fromInv?.quantity ?? 0
        const fromAfter = Math.max(0, fromBefore - qty)

        await prisma.inventory.upsert({
          where: { productId_storeId: { productId: line.productId, storeId: order.fromStoreId } },
          update: { quantity: fromAfter },
          create: { productId: line.productId, storeId: order.fromStoreId, quantity: 0 },
        })

        await prisma.inventoryTransaction.create({
          data: {
            productId: line.productId,
            storeId: order.fromStoreId,
            type: 'transfer_out',
            quantity: -qty,
            beforeQty: fromBefore,
            afterQty: fromAfter,
            reference: order.orderNumber,
            notes: `Transfer out to ${order.toStoreId}`,
          },
        })

        // Add to toStore
        const toInv = await prisma.inventory.findUnique({
          where: { productId_storeId: { productId: line.productId, storeId: order.toStoreId } },
        })
        const toBefore = toInv?.quantity ?? 0
        const toAfter = toBefore + qty

        await prisma.inventory.upsert({
          where: { productId_storeId: { productId: line.productId, storeId: order.toStoreId } },
          update: { quantity: toAfter },
          create: { productId: line.productId, storeId: order.toStoreId, quantity: qty },
        })

        await prisma.inventoryTransaction.create({
          data: {
            productId: line.productId,
            storeId: order.toStoreId,
            type: 'transfer_in',
            quantity: qty,
            beforeQty: toBefore,
            afterQty: toAfter,
            reference: order.orderNumber,
            notes: `Transfer in from ${order.fromStoreId}`,
          },
        })

        // Update received qty on line
        await prisma.transferLine.update({
          where: { id: line.id },
          data: { quantityReceived: qty },
        })
      }
    }

    const updated = await prisma.transferOrder.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.shipmentDate !== undefined
          ? { shipmentDate: body.shipmentDate ? new Date(body.shipmentDate) : null }
          : {}),
        ...(body.receiptDate !== undefined
          ? { receiptDate: body.receiptDate ? new Date(body.receiptDate) : null }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      include: {
        fromStore: { select: { id: true, name: true, city: true, state: true } },
        toStore: { select: { id: true, name: true, city: true, state: true } },
        lines: { include: { product: { select: { id: true, name: true, sku: true, unit: true } } } },
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
