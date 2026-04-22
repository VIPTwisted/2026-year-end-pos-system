import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.assemblyOrder.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true, salePrice: true } },
      store: { select: { id: true, name: true } },
      bom: { select: { id: true, type: true, description: true } },
      lines: {
        include: {
          component: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const order = await prisma.assemblyOrder.findUnique({ where: { id }, select: { status: true } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const TRANSITIONS: Record<string, string[]> = {
    open: ['released'],
    released: ['finished', 'open'],
    finished: [],
  }
  if (body.status && !TRANSITIONS[order.status]?.includes(body.status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${order.status} to ${body.status}` },
      { status: 400 }
    )
  }

  // Handle line picks if provided
  if (body.lines && Array.isArray(body.lines)) {
    for (const l of body.lines as { id: string; quantityPicked: number }[]) {
      await prisma.assemblyOrderLine.update({
        where: { id: l.id },
        data: { quantityPicked: l.quantityPicked },
      })
    }
  }

  const updated = await prisma.assemblyOrder.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.quantityToAssemble !== undefined ? { quantityToAssemble: body.quantityToAssemble } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
    },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      store: { select: { id: true, name: true } },
      lines: { include: { component: { select: { id: true, name: true, sku: true } } } },
    },
  })
  return NextResponse.json(updated)
}
