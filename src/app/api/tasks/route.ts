import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const tasks = await prisma.storeTask.findMany({
      where: status ? { status } : undefined,
      include: { store: true, taskList: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json(tasks)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, storeId, assignedTo, dueDate, priority, taskListId } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const task = await prisma.storeTask.create({
      data: {
        title: title.trim(),
        description: description?.trim() || undefined,
        storeId: storeId || undefined,
        assignedTo: assignedTo?.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority: priority ?? 'medium',
        taskListId: taskListId || undefined,
      },
      include: { store: true, taskList: true },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
