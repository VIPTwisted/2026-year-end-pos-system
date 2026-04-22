import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const segments = await prisma.crmSegment.findMany({
    include: { campaigns: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(segments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const segment = await prisma.crmSegment.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      segmentType: body.segmentType ?? 'static',
      criteria: body.criteria ? JSON.stringify(body.criteria) : '{}',
      memberCount: body.memberCount ?? 0,
    },
  })
  return NextResponse.json(segment, { status: 201 })
}
