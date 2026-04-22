import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const actuals = await prisma.projectActual.findMany({
    where: {
      projectId: id,
      ...(type ? { type } : {}),
    },
    include: {
      resource: { select: { id: true, resourceNo: true, name: true } },
    },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(actuals)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { type, amount, hours, resourceId, taskId, description, date } = body as {
      type?:        string
      amount?:      number
      hours?:       number
      resourceId?:  string
      taskId?:      string
      description?: string
      date?:        string
    }

    const actual = await prisma.projectActual.create({
      data: {
        projectId:   id,
        type:        type        ?? 'cost',
        amount:      Number(amount  ?? 0),
        hours:       Number(hours   ?? 0),
        resourceId:  resourceId  ?? undefined,
        taskId:      taskId      ?? undefined,
        description: description ?? undefined,
        date:        date ? new Date(date) : new Date(),
      },
      include: {
        resource: { select: { id: true, resourceNo: true, name: true } },
      },
    })
    return NextResponse.json(actual, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
