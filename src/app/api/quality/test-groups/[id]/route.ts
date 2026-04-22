import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const group = await prisma.qualityTestGroup.findUnique({
    where: { id },
    include: { tests: { orderBy: { createdAt: 'asc' } } },
  })
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(group)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, description } = body

  const updated = await prisma.qualityTestGroup.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
    },
    include: { tests: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.qualityTestGroup.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
