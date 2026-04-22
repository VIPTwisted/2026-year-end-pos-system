import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const tasks = await prisma.projectTask.findMany({
    where: { projectId: id },
    include: { resource: { select: { id: true, name: true, resourceNo: true } } },
    orderBy: [{ sortOrder: 'asc' }, { taskNo: 'asc' }],
  })
  return NextResponse.json(tasks)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const body = await req.json()
    const {
      taskNo,
      description,
      taskType,
      parentTaskId,
      resourceId,
      startDate,
      endDate,
      budgetHours,
      sortOrder,
      indentation,
    } = body as {
      taskNo: string
      description: string
      taskType?: string
      parentTaskId?: string
      resourceId?: string
      startDate?: string
      endDate?: string
      budgetHours?: number
      sortOrder?: number
      indentation?: number
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId: id,
        taskNo: taskNo.trim(),
        description: description.trim(),
        taskType: taskType ?? 'task',
        parentTaskId: parentTaskId ?? null,
        resourceId: resourceId ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budgetHours: budgetHours ?? 0,
        sortOrder: sortOrder ?? 0,
        indentation: indentation ?? 0,
      },
      include: { resource: { select: { id: true, name: true, resourceNo: true } } },
    })
    return NextResponse.json(task, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const body = await req.json()
    const {
      taskId,
      percentComplete,
      status,
      startDate,
      endDate,
      description,
      budgetHours,
      resourceId,
    } = body as {
      taskId: string
      percentComplete?: number
      status?: string
      startDate?: string | null
      endDate?: string | null
      description?: string
      budgetHours?: number
      resourceId?: string | null
    }

    const task = await prisma.projectTask.update({
      where: { id: taskId, projectId: id },
      data: {
        ...(percentComplete !== undefined && { percentComplete }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(description !== undefined && { description: description.trim() }),
        ...(budgetHours !== undefined && { budgetHours }),
        ...(resourceId !== undefined && { resourceId: resourceId ?? null }),
      },
      include: { resource: { select: { id: true, name: true, resourceNo: true } } },
    })
    return NextResponse.json(task)
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
