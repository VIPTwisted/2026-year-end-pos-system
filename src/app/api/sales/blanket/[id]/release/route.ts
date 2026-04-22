import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { lineIds, releaseDate } = body

  if (!lineIds || !Array.isArray(lineIds) || lineIds.length === 0) {
    return NextResponse.json({ error: 'lineIds required' }, { status: 400 })
  }

  const blanket = await prisma.blanketSalesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      store: true,
      lines: { include: { product: true } },
    },
  })
  if (!blanket) return NextResponse.json({ error: 'Blanket Sales Order not found' }, { status: 404 })
  if (blanket.status === 'closed') return NextResponse.json({ error: 'Blanket Sales Order is closed' }, { status: 400 })

  const selectedLines = blanket.lines.filter((l) => lineIds.includes(l.id))
  if (selectedLines.length === 0) return NextResponse.json({ error: 'No matching lines found' }, { status: 400 })

  // Auto-generate order number
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

  let subtotal = 0
  const orderItems = selectedLines.map((l) => {
    const remaining = l.quantity - l.qtyShipped
    const qty = Math.max(0, remaining)
    const lineTotal = qty * l.unitPrice
    subtotal += lineTotal
    return {
      productId: l.productId,
      productName: l.product.name,
      sku: l.product.sku,
      quantity: qty,
      unitPrice: l.unitPrice,
      discount: 0,
      taxAmount: 0,
      lineTotal,
    }
  })

  if (!blanket.storeId) return NextResponse.json({ error: 'Blanket order has no store assigned' }, { status: 400 })

  const order = await prisma.order.create({
    data: {
      orderNumber,
      storeId: blanket.storeId,
      customerId: blanket.customerId,
      status: 'pending',
      subtotal,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: subtotal,
      notes: `Released from Blanket SO ${blanket.orderNumber}`,
      items: { create: orderItems },
    },
    include: { store: true, customer: true, items: true },
  })

  // Update shipped quantities on blanket lines
  await prisma.$transaction(
    selectedLines.map((l) =>
      prisma.blanketSalesLine.update({
        where: { id: l.id },
        data: { qtyShipped: { increment: l.quantity - l.qtyShipped } },
      })
    )
  )

  return NextResponse.json({ order }, { status: 201 })
}
