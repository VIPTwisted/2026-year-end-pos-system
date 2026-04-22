import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const storeId = searchParams.get('storeId')

    const orders = await prisma.transferOrder.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(storeId
          ? { OR: [{ fromStoreId: storeId }, { toStoreId: storeId }] }
          : {}),
      },
      include: {
        fromStore: { select: { id: true, name: true } },
        toStore: { select: { id: true, name: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      fromStoreId: string
      toStoreId: string
      lines?: { productId: string; quantity: number; unitOfMeasure?: string }[]
      notes?: string
      shipmentDate?: string
      receiptDate?: string
    }

    if (!body.fromStoreId || !body.toStoreId) {
      return NextResponse.json({ error: 'fromStoreId and toStoreId are required' }, { status: 400 })
    }
    if (body.fromStoreId === body.toStoreId) {
      return NextResponse.json({ error: 'Source and destination stores must differ' }, { status: 400 })
    }

    // Auto-number: TRF-YYYY-NNNN
    const year = new Date().getFullYear()
    const prefix = `TRF-${year}-`
    const last = await prisma.transferOrder.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    })
    const seq = last ? parseInt(last.orderNumber.slice(prefix.length)) + 1 : 1
    const orderNumber = `${prefix}${String(seq).padStart(4, '0')}`

    const order = await prisma.transferOrder.create({
      data: {
        orderNumber,
        fromStoreId: body.fromStoreId,
        toStoreId: body.toStoreId,
        status: 'open',
        shipmentDate: body.shipmentDate ? new Date(body.shipmentDate) : null,
        receiptDate: body.receiptDate ? new Date(body.receiptDate) : null,
        notes: body.notes ?? null,
        lines: body.lines
          ? {
              create: body.lines.map(l => ({
                productId: l.productId,
                quantity: l.quantity,
                unitOfMeasure: l.unitOfMeasure ?? 'EACH',
              })),
            }
          : undefined,
      },
      include: {
        fromStore: { select: { id: true, name: true } },
        toStore: { select: { id: true, name: true } },
        lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
