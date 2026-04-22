import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const now = new Date()
  const task = await prisma.associateTask.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.status === 'completed' ? { completedAt: now } : {}),
    },
  })
  return NextResponse.json(task)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.associateTask.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
