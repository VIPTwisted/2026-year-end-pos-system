import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cost = await prisma.landedCost.findUnique({
    where: { id },
    include: {
      purchaseOrder: { select: { id: true, poNumber: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  })
  if (!cost) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(cost)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const cost = await prisma.landedCost.findUnique({ where: { id }, select: { status: true } })
  if (!cost) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.status === 'posted' && cost.status !== 'open') {
    return NextResponse.json({ error: 'Only open landed costs can be posted' }, { status: 400 })
  }

  const updated = await prisma.landedCost.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.vendor !== undefined ? { vendor: body.vendor } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.amount !== undefined ? { amount: body.amount } : {}),
      ...(body.costType !== undefined ? { costType: body.costType } : {}),
      ...(body.allocationMethod !== undefined ? { allocationMethod: body.allocationMethod } : {}),
    },
    include: {
      purchaseOrder: { select: { id: true, poNumber: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  })
  return NextResponse.json(updated)
}
