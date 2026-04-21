import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const supplierId = searchParams.get('supplierId')

  const pos = await prisma.purchaseOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(supplierId ? { supplierId } : {}),
    },
    include: {
      supplier: true,
      store: { select: { id: true, name: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(pos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { supplierId, storeId, expectedDate, notes, shippingCost, lines } = body

  if (!supplierId || !storeId) {
    return NextResponse.json({ error: 'supplierId and storeId are required' }, { status: 400 })
  }
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 })
  }

  // Auto-generate sequential PO number: PO-2026-NNN
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

  type RawLine = {
    productId: string
    productName: string
    sku: string
    orderedQty: number
    unitCost: number
  }

  let subtotal = 0
  const processedLines = (lines as RawLine[]).map(l => {
    const qty = Number(l.orderedQty) || 0
    const cost = Number(l.unitCost) || 0
    const lineTotal = qty * cost
    subtotal += lineTotal
    return {
      productId: l.productId,
      productName: l.productName,
      sku: l.sku,
      orderedQty: qty,
      unitCost: cost,
      lineTotal,
    }
  })

  const shipping = Number(shippingCost) || 0
  const totalAmount = subtotal + shipping

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      supplierId,
      storeId,
      status: 'draft',
      subtotal,
      taxAmount: 0,
      shippingCost: shipping,
      totalAmount,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      notes: notes || null,
      items: { create: processedLines },
    },
    include: { supplier: true, store: true, items: true },
  })

  return NextResponse.json(po, { status: 201 })
}
