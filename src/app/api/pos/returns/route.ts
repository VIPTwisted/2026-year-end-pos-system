import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pos/returns?orderId=xxx  — fetch order for return flow
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId')
    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
        payments: true,
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (e) {
    console.error('[pos/returns GET]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface ReturnItemInput {
  orderItemId: string
  quantity: number
  reason: string
}

interface ReturnRequestBody {
  originalOrderId: string
  items: ReturnItemInput[]
  refundMethod: string
  notes?: string
}

// POST /api/pos/returns — process a POS return via SalesReturn model
export async function POST(req: NextRequest) {
  try {
    const body: ReturnRequestBody = await req.json()
    const { originalOrderId, items, refundMethod, notes } = body

    if (!originalOrderId || !items?.length) {
      return NextResponse.json(
        { error: 'originalOrderId and items required' },
        { status: 400 },
      )
    }

    const originalOrder = await prisma.order.findUnique({
      where: { id: originalOrderId },
      include: { items: true, store: true },
    })
    if (!originalOrder) {
      return NextResponse.json({ error: 'Original order not found' }, { status: 404 })
    }

    // Must have a customerId to create SalesReturn (schema requires customer relation)
    if (!originalOrder.customerId) {
      return NextResponse.json(
        { error: 'Original order has no customer — walk-in returns must use manual flow' },
        { status: 422 },
      )
    }

    // Build return lines and calculate totals
    let subtotal = 0
    let taxRefund = 0

    const returnLines: {
      productId: string
      quantity: number
      unitPrice: number
      lineTotal: number
      condition: string
      restockable: boolean
    }[] = []

    // Also track for inventory restock
    const restockEntries: {
      productId: string
      storeId: string
      quantity: number
      orderNumber: string
    }[] = []

    for (const ri of items) {
      const originalItem = originalOrder.items.find(i => i.id === ri.orderItemId)
      if (!originalItem) continue

      const qty = Math.min(ri.quantity, originalItem.quantity)
      const lineSub = originalItem.unitPrice * qty
      // Pro-rate tax from original line
      const lineTax = originalItem.quantity > 0
        ? originalItem.taxAmount * (qty / originalItem.quantity)
        : 0

      subtotal += lineSub
      taxRefund += lineTax

      returnLines.push({
        productId: originalItem.productId,
        quantity: qty,
        unitPrice: originalItem.unitPrice,
        lineTotal: lineSub,
        condition: 'good',
        restockable: true,
      })

      restockEntries.push({
        productId: originalItem.productId,
        storeId: originalOrder.storeId,
        quantity: qty,
        orderNumber: originalOrder.orderNumber,
      })
    }

    const total = subtotal + taxRefund

    // Generate unique return number
    const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}`

    const salesReturn = await prisma.salesReturn.create({
      data: {
        returnNumber,
        customerId: originalOrder.customerId,
        storeId: originalOrder.storeId,
        originalOrderId,
        returnReason: items[0]?.reason ?? 'other',
        refundMethod: refundMethod || 'cash',
        subtotal,
        taxRefund,
        total,
        notes: notes ?? null,
        status: 'completed',
        lines: {
          create: returnLines,
        },
      },
      include: { lines: true, customer: true, store: true },
    })

    // Restock inventory — non-fatal per item
    for (const entry of restockEntries) {
      try {
        const inv = await prisma.inventory.findFirst({
          where: { productId: entry.productId, storeId: entry.storeId },
        })
        if (inv) {
          const beforeQty = inv.quantity
          await prisma.inventory.update({
            where: { id: inv.id },
            data: { quantity: { increment: entry.quantity } },
          })
          await prisma.inventoryTransaction.create({
            data: {
              productId: entry.productId,
              storeId: entry.storeId,
              type: 'RETURN',
              quantity: entry.quantity,
              beforeQty,
              afterQty: beforeQty + entry.quantity,
              reference: salesReturn.returnNumber,
              notes: `POS return from order ${entry.orderNumber}`,
            },
          })
        }
      } catch (invErr) {
        console.error('[pos/returns POST] inventory restock failed (non-fatal):', invErr)
      }
    }

    return NextResponse.json(
      { salesReturn, returnTotal: total },
      { status: 201 },
    )
  } catch (e) {
    console.error('[pos/returns POST]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
