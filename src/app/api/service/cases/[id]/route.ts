import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const c = await prisma.serviceCase2.findUnique({
    where: { id },
    include: {
      notes:        { orderBy: { createdAt: 'asc' } },
      satisfaction: true,
      queue:        true,
      sla:          true,
    },
  })
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(c)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const {
    status, priority, assignedTo, queueId,
    tags, subject, description, customerName,
    customerEmail, channel, orderId,
  } = body

  const updated = await prisma.serviceCase2.update({
    where: { id },
    data: {
      ...(status !== undefined        && { status }),
      ...(priority !== undefined      && { priority }),
      ...(assignedTo !== undefined    && { assignedTo }),
      ...(queueId !== undefined       && { queueId }),
      ...(tags !== undefined          && { tags }),
      ...(subject !== undefined       && { subject }),
      ...(description !== undefined   && { description }),
      ...(customerName !== undefined  && { customerName }),
      ...(customerEmail !== undefined && { customerEmail }),
      ...(channel !== undefined       && { channel }),
      ...(orderId !== undefined       && { orderId }),
    },
    include: { queue: true, sla: true, notes: true, satisfaction: true },
  })
  return NextResponse.json(updated)
}
