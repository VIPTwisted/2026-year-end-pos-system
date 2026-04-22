import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const assignedTo = searchParams.get('assignedTo')
  const listType = searchParams.get('listType')
  const status = searchParams.get('status')

  const lists = await prisma.clientelingList.findMany({
    where: {
      ...(assignedTo ? { assignedTo } : {}),
      ...(listType ? { listType } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      _count: { select: { entries: true, activities: true } },
      entries: { select: { status: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(lists)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const list = await prisma.clientelingList.create({
    data: {
      name: body.name,
      description: body.description,
      assignedTo: body.assignedTo,
      listType: body.listType || 'general',
      status: body.status || 'active',
    },
  })
  return NextResponse.json(list, { status: 201 })
}
