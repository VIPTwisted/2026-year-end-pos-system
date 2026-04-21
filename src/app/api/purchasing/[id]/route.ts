import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      store: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          receiptLines: true,
        },
      },
      receipts: {
        include: { lines: true },
        orderBy: { receivedAt: 'desc' },
      },
    },
  })

  if (!po) {
    return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
  }

  return NextResponse.json(po)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, notes } = body

  const existing = await prisma.purchaseOrder.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
  }

  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
    include: { supplier: true, store: true, items: true, receipts: true },
  })

  return NextResponse.json(po)
}
