import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { vendorQuoteId } = body

  if (!vendorQuoteId) return NextResponse.json({ error: 'vendorQuoteId required' }, { status: 400 })

  const rfq = await prisma.purchaseRFQ.findUnique({
    where: { id },
    include: { quotes: { include: { lines: { include: { product: true } } } } },
  })
  if (!rfq) return NextResponse.json({ error: 'RFQ not found' }, { status: 404 })

  const awardedQuote = rfq.quotes.find(q => q.id === vendorQuoteId)
  if (!awardedQuote) return NextResponse.json({ error: 'Quote not found on this RFQ' }, { status: 404 })

  // Award the selected quote and close others
  await prisma.$transaction([
    prisma.vendorQuote.update({ where: { id: vendorQuoteId }, data: { isAwarded: true } }),
    ...rfq.quotes
      .filter(q => q.id !== vendorQuoteId)
      .map(q => prisma.vendorQuote.update({ where: { id: q.id }, data: { isAwarded: false } })),
    prisma.purchaseRFQ.update({ where: { id }, data: { status: 'awarded' } }),
  ])

  // Get default store
  const store = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!store) return NextResponse.json({ error: 'No store found to create PO' }, { status: 400 })

  // Get vendor to find supplier mapping (or create PO with vendorId ref)
  // We use Supplier model for POs — find or use first available
  const vendor = await prisma.vendor.findUnique({ where: { id: awardedQuote.vendorId } })

  // Find a supplier that matches vendor by name, or use first supplier
  let supplier = await prisma.supplier.findFirst({
    where: { name: { contains: vendor?.name ?? '' } },
  })
  if (!supplier) {
    supplier = await prisma.supplier.findFirst()
  }

  if (!supplier) {
    // Cannot create PO without supplier; return success without PO
    return NextResponse.json({ awarded: true, poCreated: false, message: 'No supplier found to link PO' })
  }

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
  const poLines = awardedQuote.lines.map(l => {
    const lineTotal = l.quantity * l.unitPrice
    subtotal += lineTotal
    return {
      productId: l.productId,
      productName: l.product.name,
      sku: l.product.sku,
      orderedQty: l.quantity,
      unitCost: l.unitPrice,
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
      notes: `Created from RFQ ${rfq.rfqNumber}, Quote from ${vendor?.name ?? 'vendor'}`,
      items: { create: poLines },
    },
    include: { supplier: true, store: true, items: true },
  })

  return NextResponse.json({ awarded: true, poCreated: true, po }, { status: 201 })
}
