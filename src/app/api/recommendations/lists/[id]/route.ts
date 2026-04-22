import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const list = await prisma.recommendationList.findUnique({
    where: { id },
    include: { items: { orderBy: { rank: 'asc' } } },
  })
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(list)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const list = await prisma.recommendationList.update({
    where: { id },
    data: {
      listName: body.listName,
      listType: body.listType,
      description: body.description,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(list)
}
