import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const list = await prisma.taskList.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(list)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, description, dueDate, storeId, assignedTo, status } = body

  const list = await prisma.taskList.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(storeId !== undefined ? { storeId } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(status !== undefined ? { status } : {}),
    },
    include: { tasks: { orderBy: { sortOrder: 'asc' } } },
  })

  return NextResponse.json(list)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.taskList.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
