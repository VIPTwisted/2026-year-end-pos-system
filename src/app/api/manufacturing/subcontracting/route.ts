import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const orders = await prisma.subcontractingOrder.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      vendor: { select: { id: true, name: true, vendorCode: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
    },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.vendorId || !body.quantity || !body.description) {
    return NextResponse.json(
      { error: 'vendorId, quantity, and description are required' },
      { status: 400 },
    )
  }

  const year = new Date().getFullYear()
  const count = await prisma.subcontractingOrder.count()
  const orderNumber = `SUB-${year}-${String(count + 1).padStart(4, '0')}`

  const order = await prisma.subcontractingOrder.create({
    data: {
      orderNumber,
      vendorId: body.vendorId,
      productionOrderId: body.productionOrderId || null,
      workCenterId: body.workCenterId || null,
      operationNo: body.operationNo || null,
      description: body.description.trim(),
      status: 'open',
      quantity: Number(body.quantity),
      unitOfMeasure: body.unitOfMeasure || 'EACH',
      unitCost: Number(body.unitCost ?? 0),
      totalCost: Number(body.unitCost ?? 0) * Number(body.quantity),
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
      notes: body.notes?.trim() || null,
      lines: body.lines?.length
        ? {
            create: body.lines.map((l: { productId: string; quantity: number; type?: string; unitOfMeasure?: string }) => ({
              productId: l.productId,
              quantity: Number(l.quantity),
              type: l.type || 'component',
              unitOfMeasure: l.unitOfMeasure || 'EACH',
            })),
          }
        : undefined,
    },
    include: {
      vendor: { select: { id: true, name: true, vendorCode: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
    },
  })
  return NextResponse.json(order, { status: 201 })
}
