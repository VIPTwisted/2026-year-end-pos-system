import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lists = await prisma.recommendationList.findMany({
    include: { items: true },
    orderBy: { listName: 'asc' },
  })
  return NextResponse.json(lists)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const list = await prisma.recommendationList.create({
    data: {
      listName: body.listName,
      listType: body.listType,
      description: body.description ?? null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(list, { status: 201 })
}
