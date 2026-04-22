import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const segment = await prisma.contactSegment.findUnique({
    where: { id: params.id },
    include: {
      memberships: {
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              loyaltyPoints: true,
              totalSpent: true,
              createdAt: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
        take: 200,
      },
    },
  })
  if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(segment)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { action, ...data } = body

  if (action === 'refresh') {
    // Refresh member count from actual memberships
    const count = await prisma.contactSegmentMember.count({ where: { segmentId: params.id } })
    const segment = await prisma.contactSegment.update({
      where: { id: params.id },
      data: { memberCount: count, lastRefreshed: new Date() },
    })
    return NextResponse.json(segment)
  }

  const segment = await prisma.contactSegment.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(segment)
}
