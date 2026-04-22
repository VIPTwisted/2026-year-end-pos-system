import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  simulated: ['planned'],
  planned: ['firm_planned'],
  firm_planned: ['released'],
  released: ['finished'],
  finished: [],
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.productionOrder.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true, unit: true } },
      store: { select: { id: true, name: true } },
      bom: { select: { id: true, bomNumber: true, description: true } },
      routing: { select: { id: true, routingNumber: true, description: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
        orderBy: { lineNo: 'asc' },
      },
      capacityNeeds: { orderBy: { operationNo: 'asc' } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const current = await prisma.productionOrder.findUnique({
    where: { id },
    select: { status: true, quantity: true },
  })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (body.status && body.status !== current.status) {
    const allowed = STATUS_TRANSITIONS[current.status] ?? []
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${current.status} to ${body.status}` },
        { status: 400 },
      )
    }
    if (body.status === 'finished') {
      const qf = Number(body.quantityFinished ?? 0)
      if (qf <= 0) {
        return NextResponse.json(
          { error: 'quantityFinished must be > 0 to finish order' },
          { status: 400 },
        )
      }
      data.quantityFinished = qf
    }
    data.status = body.status
  }

  if ('quantityFinished' in body && body.status !== 'finished') {
    data.quantityFinished = Number(body.quantityFinished)
  }

  if ('notes' in body) data.notes = body.notes?.trim() || null
  if ('dueDate' in body) data.dueDate = body.dueDate ? new Date(body.dueDate) : null
  if ('startingDate' in body) data.startingDate = body.startingDate ? new Date(body.startingDate) : null
  if ('endingDate' in body) data.endingDate = body.endingDate ? new Date(body.endingDate) : null

  const order = await prisma.productionOrder.update({ where: { id }, data })
  return NextResponse.json(order)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.productionOrder.findUnique({ where: { id }, select: { status: true } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.status === 'released' || order.status === 'finished') {
    return NextResponse.json(
      { error: 'Cannot delete a released or finished production order' },
      { status: 400 },
    )
  }
  await prisma.productionOrder.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
