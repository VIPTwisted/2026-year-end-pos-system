import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { lineIds, releaseDate } = body

  if (!lineIds || !Array.isArray(lineIds) || lineIds.length === 0) {
    return NextResponse.json({ error: 'lineIds required' }, { status: 400 })
  }

  const blanket = await prisma.blanketPurchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines: { include: { product: true } },
    },
  })
  if (!blanket) return NextResponse.json({ error: 'Blanket PO not found' }, { status: 404 })
  if (blanket.status === 'closed') return NextResponse.json({ error: 'Blanket PO is closed' }, { status: 400 })

  const selectedLines = blanket.lines.filter(l => lineIds.includes(l.id))
  if (selectedLines.length === 0) return NextResponse.json({ error: 'No matching lines found' }, { status: 400 })

  // Get default store
  const store = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!store) return NextResponse.json({ error: 'No store found' }, { status: 400 })

  // Find supplier by vendor name
  let supplier = await prisma.supplier.findFirst({
    where: { name: { contains: blanket.vendor.name } },
  })
  if (!supplier) supplier = await prisma.supplier.findFirst()
  if (!supplier) return NextResponse.json({ error: 'No supplier found to create PO' }, { status: 400 })

  // Auto-generate PO number
  const year = new Date().getFullYear()
  const lastPO = await prisma.purchaseOrder.findFirst({
    where: { poNumber: { startsWith: `PO-${year}-` } },
    orderBy: { createdAt: 'desc' },
  })
  let seq = 1
  if (lastPO) {
    const parts = lastPO.poNumber.split('-')
    const n = parseInt(parts[2] ?? '0', 10)
    if (!isNaN(n)) seq = n + 1
  }
  const poNumber = `PO-${year}-${String(seq).padStart(3, '0')}`

  let subtotal = 0
  const poLines = selectedLines.map(l => {
    const remaining = l.quantity - l.qtyReceived
    const qty = Math.max(0, remaining)
    const lineTotal = qty * l.unitCost
    subtotal += lineTotal
    return {
      productId: l.productId,
      productName: l.product.name,
      sku: l.product.sku,
      orderedQty: qty,
      unitCost: l.unitCost,
      lineTotal,
    }
  })

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      supplierId: supplier.id,
      storeId: store.id,
      status: 'draft',
      subtotal,
      taxAmount: 0,
      shippingCost: 0,
      totalAmount: subtotal,
      expectedDate: releaseDate ? new Date(releaseDate) : null,
      notes: `Released from Blanket PO ${blanket.orderNumber}`,
      items: { create: poLines },
    },
    include: { supplier: true, store: true, items: true },
  })

  // Update received quantities on blanket lines
  await prisma.$transaction(
    selectedLines.map(l =>
      prisma.blanketPurchaseOrderLine.update({
        where: { id: l.id },
        data: { qtyReceived: { increment: l.quantity - l.qtyReceived } },
      })
    )
  )

  return NextResponse.json({ po }, { status: 201 })
}
