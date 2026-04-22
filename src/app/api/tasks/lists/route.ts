import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')

  const lists = await prisma.taskList.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      tasks: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(lists)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, dueDate, storeId, assignedTo, createdBy, tasks: taskItems } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const list = await prisma.taskList.create({
    data: {
      name,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      storeId,
      assignedTo,
      createdBy,
      tasks: taskItems?.length
        ? {
            create: taskItems.map((t: { title: string; priority?: string; assignedTo?: string; dueDate?: string }, i: number) => ({
              title: t.title,
              priority: t.priority ?? 'normal',
              assignedTo: t.assignedTo,
              dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
              sortOrder: i,
            })),
          }
        : undefined,
    },
    include: { tasks: true },
  })

  return NextResponse.json(list, { status: 201 })
}
