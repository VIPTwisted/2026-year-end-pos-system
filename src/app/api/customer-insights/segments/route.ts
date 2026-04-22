import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  const segments = await prisma.cISegment.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(segments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const segment = await prisma.cISegment.create({
    data: {
      segmentName: body.segmentName,
      description: body.description ?? null,
      segmentType: body.segmentType ?? 'static',
      queryJson: body.queryJson ?? null,
      isActive: body.isActive ?? true,
      refreshSchedule: body.refreshSchedule ?? null,
    },
  })
  return NextResponse.json(segment, { status: 201 })
}
