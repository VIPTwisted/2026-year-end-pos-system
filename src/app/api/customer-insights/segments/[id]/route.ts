import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const segment = await prisma.cISegment.findUnique({
    where: { id },
    include: { _count: { select: { members: true } }, members: { take: 10, orderBy: { addedAt: 'desc' } } },
  })
  if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(segment)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.cISegment.update({
    where: { id },
    data: {
      ...(body.segmentName !== undefined && { segmentName: body.segmentName }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.segmentType !== undefined && { segmentType: body.segmentType }),
      ...(body.queryJson !== undefined && { queryJson: body.queryJson }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.refreshSchedule !== undefined && { refreshSchedule: body.refreshSchedule }),
      ...(body.memberCount !== undefined && { memberCount: body.memberCount }),
    },
  })
  return NextResponse.json(updated)
}
