import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const assignedTo = searchParams.get('assignedTo')
  const status = searchParams.get('status')
  const taskType = searchParams.get('taskType')

  const tasks = await prisma.associateTask.findMany({
    where: {
      ...(assignedTo ? { assignedTo } : {}),
      ...(status ? { status } : {}),
      ...(taskType ? { taskType } : {}),
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const task = await prisma.associateTask.create({
    data: {
      assignedTo: body.assignedTo,
      taskType: body.taskType || 'clienteling',
      customerName: body.customerName || null,
      customerId: body.customerId || null,
      subject: body.subject,
      description: body.description || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      priority: body.priority || 'normal',
      status: 'open',
    },
  })
  return NextResponse.json(task, { status: 201 })
}
