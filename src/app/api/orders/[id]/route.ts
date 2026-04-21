import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      store: { select: { id: true, name: true } },
      items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      payments: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (body.status === 'voided' && !['pending', 'paid'].includes(order.status)) {
    return NextResponse.json({ error: 'Cannot void order in current status' }, { status: 400 })
  }
  const updated = await prisma.order.update({ where: { id }, data: { status: body.status, notes: body.notes } })
  return NextResponse.json(updated)
}
