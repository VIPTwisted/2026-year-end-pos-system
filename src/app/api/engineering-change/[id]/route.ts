import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const eco = await prisma.engineeringChangeOrder.findUnique({
    where: { id },
    include: { lines: { include: { product: { select: { name: true, sku: true } } } } },
  })
  if (!eco) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(eco)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { action, ...rest } = body

  let updateData: Record<string, unknown> = {}

  if (action === 'submit_review') {
    updateData = { status: 'review' }
  } else if (action === 'approve') {
    updateData = { status: 'approved', approvedAt: new Date(), approvedBy: rest.approvedBy ?? 'System' }
  } else if (action === 'reject') {
    updateData = { status: 'rejected' }
  } else if (action === 'implement') {
    updateData = { status: 'implemented' }
  } else {
    // General update
    if (rest.title !== undefined) updateData.title = rest.title
    if (rest.description !== undefined) updateData.description = rest.description
    if (rest.priority !== undefined) updateData.priority = rest.priority
    if (rest.effectiveDate !== undefined) updateData.effectiveDate = rest.effectiveDate ? new Date(rest.effectiveDate) : null
    if (rest.status !== undefined) updateData.status = rest.status
  }

  const eco = await prisma.engineeringChangeOrder.update({
    where: { id },
    data: updateData,
    include: { lines: true },
  })
  return NextResponse.json(eco)
}
