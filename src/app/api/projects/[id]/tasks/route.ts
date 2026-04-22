import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tasks = await prisma.projectTask.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { taskNo, description, taskType, indentation, budgetHours } = body

    if (!taskNo?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Task no and description required' }, { status: 400 })
    }

    const lastTask = await prisma.projectTask.findFirst({
      where: { projectId: id },
      orderBy: { sortOrder: 'desc' },
    })
    const sortOrder = (lastTask?.sortOrder ?? 0) + 10

    const task = await prisma.projectTask.create({
      data: {
        projectId: id,
        taskNo: taskNo.trim(),
        description: description.trim(),
        taskType: taskType || 'posting',
        indentation: indentation ?? 0,
        budgetHours: budgetHours ? parseFloat(budgetHours) : 0,
        sortOrder,
      },
    })
    return NextResponse.json(task, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
