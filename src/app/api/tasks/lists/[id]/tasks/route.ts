import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tasks = await prisma.task.findMany({
    where: { taskListId: id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { title, description, priority, assignedTo, dueDate, notes } = body

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const count = await prisma.task.count({ where: { taskListId: id } })

  const task = await prisma.task.create({
    data: {
      taskListId: id,
      title,
      description,
      priority: priority ?? 'normal',
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      sortOrder: count,
    },
  })

  return NextResponse.json(task, { status: 201 })
}
