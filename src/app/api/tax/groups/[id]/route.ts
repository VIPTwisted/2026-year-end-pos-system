import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const group = await prisma.taxGroup.findUnique({
    where: { id },
    include: { components: true },
  })
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(group)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const group = await prisma.taxGroup.update({
    where: { id },
    data: {
      groupName: body.groupName,
      description: body.description,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(group)
}
