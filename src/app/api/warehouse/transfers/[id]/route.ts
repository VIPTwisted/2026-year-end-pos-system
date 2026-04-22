import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const transfer = await prisma.transferOrder.findUnique({
    where: { id },
    include: {
      fromStore: { select: { id: true, name: true } },
      toStore:   { select: { id: true, name: true } },
      lines: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!transfer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(transfer)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const ALLOWED_STATUSES = ['open', 'draft', 'released', 'shipped', 'received', 'completed', 'cancelled']
  const updateData: Record<string, unknown> = {}

  if (body.status && ALLOWED_STATUSES.includes(body.status)) updateData.status = body.status
  if (body.inTransitCode !== undefined) updateData.inTransitCode = body.inTransitCode
  if (body.shipmentDate !== undefined) updateData.shipmentDate = body.shipmentDate ? new Date(body.shipmentDate) : null
  if (body.receiptDate  !== undefined) updateData.receiptDate  = body.receiptDate  ? new Date(body.receiptDate)  : null
  if (body.notes        !== undefined) updateData.notes        = body.notes
  updateData.updatedAt = new Date()

  const transfer = await prisma.transferOrder.update({
    where: { id },
    data: updateData,
    include: {
      fromStore: { select: { id: true, name: true } },
      toStore:   { select: { id: true, name: true } },
      lines: true,
    },
  })
  return NextResponse.json(transfer)
}
