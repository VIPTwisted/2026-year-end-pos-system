import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activity = await prisma.warehouseActivity.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true } },
      receipt: { select: { id: true, receiptNo: true } },
      shipment: { select: { id: true, shipmentNo: true } },
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          bin: { select: { id: true, code: true, zone: { select: { code: true } } } },
        },
        orderBy: { lineNo: 'asc' },
      },
    },
  })
  if (!activity) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(activity)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const activity = await prisma.warehouseActivity.update({
    where: { id },
    data: {
      status: body.status,
      assignedTo: body.assignedTo,
    },
  })
  return NextResponse.json(activity)
}
