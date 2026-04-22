import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.blanketSalesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      store: true,
      lines: { include: { product: { select: { id: true, name: true, sku: true, salePrice: true } } } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status, notes, endDate } = body

  const order = await prisma.blanketSalesOrder.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
    },
    include: {
      customer: true,
      store: true,
      lines: { include: { product: true } },
    },
  })

  return NextResponse.json(order)
}
