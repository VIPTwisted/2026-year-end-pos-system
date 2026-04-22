import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const order = await prisma.subcontractingOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { type: 'asc' },
      },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.subcontractingOrder.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (body.action === 'send') {
    data.status = 'sent'
    data.sentDate = new Date()
  } else if (body.action === 'receive') {
    data.status = 'received'
    data.receivedDate = new Date()
  } else if (body.action === 'close') {
    data.status = 'closed'
  } else {
    if (body.description !== undefined) data.description = body.description
    if (body.quantity !== undefined) {
      data.quantity = Number(body.quantity)
      data.totalCost = Number(body.quantity) * (body.unitCost ?? existing.unitCost)
    }
    if (body.unitCost !== undefined) {
      data.unitCost = Number(body.unitCost)
      data.totalCost = (body.quantity ?? existing.quantity) * Number(body.unitCost)
    }
    if (body.expectedDate !== undefined)
      data.expectedDate = body.expectedDate ? new Date(body.expectedDate) : null
    if (body.notes !== undefined) data.notes = body.notes
  }

  const order = await prisma.subcontractingOrder.update({
    where: { id },
    data,
    include: {
      vendor: { select: { id: true, name: true, vendorCode: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
    },
  })
  return NextResponse.json(order)
}
