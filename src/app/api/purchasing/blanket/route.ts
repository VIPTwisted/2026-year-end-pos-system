import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const orders = await prisma.blanketPurchaseOrder.findMany({
    where: { ...(status ? { status } : {}) },
    include: {
      vendor: { select: { id: true, name: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { vendorId, startDate, endDate, notes, lines } = body

  if (!vendorId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: 'At least one line required' }, { status: 400 })
  }

  const year = new Date().getFullYear()
  const last = await prisma.blanketPurchaseOrder.findFirst({
    where: { orderNumber: { startsWith: `BPO-${year}-` } },
    orderBy: { createdAt: 'desc' },
  })
  let seq = 1
  if (last) {
    const parts = last.orderNumber.split('-')
    const n = parseInt(parts[2] ?? '0', 10)
    if (!isNaN(n)) seq = n + 1
  }
  const orderNumber = `BPO-${year}-${String(seq).padStart(4, '0')}`

  const order = await prisma.blanketPurchaseOrder.create({
    data: {
      orderNumber,
      vendorId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: 'open',
      notes: notes || null,
      lines: {
        create: (lines as Array<{ productId: string; quantity: number; unitCost: number; nextReceiveDate?: string }>).map(l => ({
          productId: l.productId,
          quantity: Number(l.quantity),
          unitCost: Number(l.unitCost),
          lineTotal: Number(l.quantity) * Number(l.unitCost),
          nextReceiveDate: l.nextReceiveDate ? new Date(l.nextReceiveDate) : null,
        })),
      },
    },
    include: {
      vendor: true,
      lines: { include: { product: true } },
    },
  })

  return NextResponse.json(order, { status: 201 })
}
