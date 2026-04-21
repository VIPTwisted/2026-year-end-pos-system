import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const lists = await prisma.taskList.findMany({
      where: { isActive: true },
      include: { store: true, _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(lists)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch task lists' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, storeId, dueDate } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const list = await prisma.taskList.create({
      data: {
        name: name.trim(),
        description: description?.trim() || undefined,
        storeId: storeId || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: { store: true },
    })

    return NextResponse.json(list, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create task list' }, { status: 500 })
  }
}
