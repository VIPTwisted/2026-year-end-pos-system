import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const orders = await prisma.blanketSalesOrder.findMany({
    where: { ...(status ? { status } : {}) },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      store: { select: { id: true, name: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, storeId, startDate, endDate, notes, lines } = body

  if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 })
  if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: 'At least one line required' }, { status: 400 })
  }

  const year = new Date().getFullYear()
  const last = await prisma.blanketSalesOrder.findFirst({
    where: { orderNumber: { startsWith: `BSO-${year}-` } },
    orderBy: { createdAt: 'desc' },
  })
  let seq = 1
  if (last) {
    const parts = last.orderNumber.split('-')
    const n = parseInt(parts[2] ?? '0', 10)
    if (!isNaN(n)) seq = n + 1
  }
  const orderNumber = `BSO-${year}-${String(seq).padStart(4, '0')}`

  const order = await prisma.blanketSalesOrder.create({
    data: {
      orderNumber,
      customerId,
      storeId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: 'open',
      notes: notes || null,
      lines: {
        create: (lines as Array<{ productId: string; quantity: number; unitPrice: number; nextShipDate?: string }>).map(l => ({
          productId: l.productId,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          lineTotal: Number(l.quantity) * Number(l.unitPrice),
          nextShipDate: l.nextShipDate ? new Date(l.nextShipDate) : null,
        })),
      },
    },
    include: {
      customer: true,
      store: true,
      lines: { include: { product: true } },
    },
  })

  return NextResponse.json(order, { status: 201 })
}
