import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const segment = await prisma.crmSegment.findUnique({
    where: { id },
    include: { campaigns: { select: { id: true, name: true, status: true } } },
  })
  if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(segment)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.crmSegment.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.segmentType !== undefined && { segmentType: body.segmentType }),
      ...(body.criteria !== undefined && { criteria: JSON.stringify(body.criteria) }),
      ...(body.memberCount !== undefined && { memberCount: body.memberCount }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.crmSegment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
