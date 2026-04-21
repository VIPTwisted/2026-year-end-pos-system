import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const task = await prisma.storeTask.findUnique({
      where: { id },
      include: { store: true, taskList: true },
    })
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(task)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, description, storeId, assignedTo, dueDate, priority, taskListId, status } = body

    const task = await prisma.storeTask.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(storeId !== undefined && { storeId: storeId || null }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo?.trim() || null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(priority !== undefined && { priority }),
        ...(taskListId !== undefined && { taskListId: taskListId || null }),
        ...(status !== undefined && { status }),
      },
      include: { store: true, taskList: true },
    })

    return NextResponse.json(task)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
