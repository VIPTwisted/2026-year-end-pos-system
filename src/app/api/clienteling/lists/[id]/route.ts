import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const list = await prisma.clientelingList.findUnique({
    where: { id },
    include: {
      entries: { orderBy: { createdAt: 'desc' } },
      activities: { orderBy: { createdAt: 'desc' }, take: 50 },
      _count: { select: { entries: true, activities: true } },
    },
  })
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(list)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const list = await prisma.clientelingList.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo } : {}),
      ...(body.listType !== undefined ? { listType: body.listType } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  })
  return NextResponse.json(list)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.clientelingList.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
