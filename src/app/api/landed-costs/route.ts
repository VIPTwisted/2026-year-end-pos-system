import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const costs = await prisma.landedCost.findMany({
    where: status ? { status } : undefined,
    include: {
      purchaseOrder: { select: { id: true, poNumber: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(costs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Auto-number: LC-YYYY-NNNN
  const year = new Date().getFullYear()
  const prefix = `LC-${year}-`
  const last = await prisma.landedCost.findFirst({
    where: { costNumber: { startsWith: prefix } },
    orderBy: { costNumber: 'desc' },
    select: { costNumber: true },
  })
  const seq = last ? parseInt(last.costNumber.slice(prefix.length)) + 1 : 1
  const costNumber = `${prefix}${String(seq).padStart(4, '0')}`

  // If linked to a PO, auto-populate lines from PO items
  let lines = body.lines
  if (body.purchaseOrderId && !lines) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: body.purchaseOrderId },
      include: { items: true },
    })
    if (po) {
      const totalQty = po.items.reduce((s, i) => s + i.orderedQty, 0)
      const totalVal = po.items.reduce((s, i) => s + i.lineTotal, 0)
      lines = po.items.map(i => ({
        productId: i.productId,
        quantity: i.orderedQty,
        allocatedAmount:
          body.allocationMethod === 'by_quantity' && totalQty > 0
            ? (i.orderedQty / totalQty) * body.amount
            : totalVal > 0
            ? (i.lineTotal / totalVal) * body.amount
            : 0,
      }))
    }
  }

  const cost = await prisma.landedCost.create({
    data: {
      costNumber,
      purchaseOrderId: body.purchaseOrderId ?? null,
      vendor: body.vendor ?? null,
      description: body.description,
      amount: body.amount,
      currency: body.currency ?? 'USD',
      costType: body.costType ?? 'freight',
      allocationMethod: body.allocationMethod ?? 'by_value',
      status: 'open',
      lines: lines
        ? {
            create: lines.map((l: { productId: string; quantity: number; allocatedAmount: number }) => ({
              productId: l.productId,
              quantity: l.quantity,
              allocatedAmount: l.allocatedAmount,
            })),
          }
        : undefined,
    },
    include: {
      purchaseOrder: { select: { id: true, poNumber: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  })
  return NextResponse.json(cost, { status: 201 })
}
