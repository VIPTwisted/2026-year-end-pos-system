import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const orders = await prisma.productionOrder.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      store: { select: { id: true, name: true } },
      bom: { select: { id: true, bomNumber: true, description: true } },
      routing: { select: { id: true, routingNumber: true, description: true } },
    },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.productId || !body.quantity || !body.storeId) {
    return NextResponse.json({ error: 'productId, quantity, and storeId are required' }, { status: 400 })
  }

  // Generate order number: PO-YYYY-NNNN
  const year = new Date().getFullYear()
  const count = await prisma.productionOrder.count()
  const orderNumber = `PO-${year}-${String(count + 1).padStart(4, '0')}`

  // Auto-populate component lines from BOM if provided
  let bomLines: Array<{
    componentProductId: string
    quantity: number
    unitOfMeasure: string
    scrapPct: number
    lineNo: number
  }> = []
  if (body.bomId) {
    const bom = await prisma.productionBOM.findUnique({
      where: { id: body.bomId },
      include: { lines: { orderBy: { lineNo: 'asc' } } },
    })
    if (bom) {
      bomLines = bom.lines.map(l => ({
        componentProductId: l.componentProductId,
        quantity: l.quantity * Number(body.quantity),
        unitOfMeasure: l.unitOfMeasure,
        scrapPct: l.scrapPct,
        lineNo: l.lineNo,
      }))
    }
  }

  const order = await prisma.productionOrder.create({
    data: {
      orderNumber,
      status: body.status || 'simulated',
      sourceType: body.sourceType || 'item',
      productId: body.productId,
      bomId: body.bomId || null,
      routingId: body.routingId || null,
      quantity: Number(body.quantity),
      unitOfMeasure: body.unitOfMeasure || 'EACH',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      startingDate: body.startingDate ? new Date(body.startingDate) : null,
      endingDate: body.endingDate ? new Date(body.endingDate) : null,
      storeId: body.storeId,
      notes: body.notes?.trim() || null,
      lines: bomLines.length
        ? {
            create: bomLines.map(l => ({
              lineNo: l.lineNo,
              productId: l.componentProductId,
              quantity: l.quantity,
              unitOfMeasure: l.unitOfMeasure,
            })),
          }
        : undefined,
    },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      store: { select: { id: true, name: true } },
      bom: { select: { id: true, bomNumber: true, description: true } },
      routing: { select: { id: true, routingNumber: true, description: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  })
  return NextResponse.json(order, { status: 201 })
}
