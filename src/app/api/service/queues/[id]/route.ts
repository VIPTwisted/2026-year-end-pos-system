import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { name, description, isActive } = body

  const queue = await prisma.caseQueue.update({
    where: { id },
    data: {
      ...(name !== undefined        && { name }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined    && { isActive }),
    },
    include: { _count: { select: { cases: true } } },
  })
  return NextResponse.json(queue)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Safety check: only delete if no cases
  const count = await prisma.serviceCase2.count({ where: { queueId: id } })
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete queue with ${count} active case(s)` },
      { status: 409 }
    )
  }

  await prisma.caseQueue.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
