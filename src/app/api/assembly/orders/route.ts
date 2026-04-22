import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const storeId = searchParams.get('storeId')

  const orders = await prisma.assemblyOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(storeId ? { storeId } : {}),
    },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      store: { select: { id: true, name: true } },
      bom: { select: { id: true, type: true } },
      lines: { include: { component: { select: { id: true, name: true, sku: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Auto-number: ASM-YYYY-NNNN
  const year = new Date().getFullYear()
  const prefix = `ASM-${year}-`
  const last = await prisma.assemblyOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })
  const seq = last ? parseInt(last.orderNumber.slice(prefix.length)) + 1 : 1
  const orderNumber = `${prefix}${String(seq).padStart(4, '0')}`

  // Fetch BOM if available for the product to auto-populate lines
  const bom = await prisma.assemblyBOM.findUnique({
    where: { productId: body.productId },
    include: { lines: true },
  })

  const order = await prisma.assemblyOrder.create({
    data: {
      orderNumber,
      productId: body.productId,
      bomId: bom?.id ?? body.bomId ?? null,
      quantity: body.quantity,
      quantityToAssemble: body.quantityToAssemble ?? 0,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      storeId: body.storeId,
      notes: body.notes ?? null,
      status: 'open',
      lines: bom
        ? {
            create: bom.lines.map(l => ({
              componentId: l.componentId,
              quantity: l.quantity * (body.quantity ?? 1),
              unitOfMeasure: l.unitOfMeasure,
            })),
          }
        : body.lines
        ? {
            create: body.lines.map((l: { componentId: string; quantity: number; unitOfMeasure?: string }) => ({
              componentId: l.componentId,
              quantity: l.quantity,
              unitOfMeasure: l.unitOfMeasure ?? 'EACH',
            })),
          }
        : undefined,
    },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      store: { select: { id: true, name: true } },
      lines: { include: { component: { select: { id: true, name: true, sku: true } } } },
    },
  })
  return NextResponse.json(order, { status: 201 })
}
