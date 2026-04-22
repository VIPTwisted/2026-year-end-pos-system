import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const segments = await prisma.contactSegment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { memberships: true } } },
  })
  return NextResponse.json(segments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, segmentType, criteriaJson, customerIds } = body

  const segment = await prisma.contactSegment.create({
    data: {
      name,
      description: description || null,
      segmentType: segmentType ?? 'static',
      criteriaJson: criteriaJson ? JSON.stringify(criteriaJson) : null,
      lastRefreshed: new Date(),
    },
  })

  // Add static members
  if (segmentType === 'static' && customerIds?.length) {
    await prisma.contactSegmentMember.createMany({
      data: customerIds.map((cid: string) => ({
        segmentId: segment.id,
        customerId: cid,
      })),
      skipDuplicates: true,
    })
    await prisma.contactSegment.update({
      where: { id: segment.id },
      data: { memberCount: customerIds.length },
    })
  }

  return NextResponse.json(segment, { status: 201 })
}
