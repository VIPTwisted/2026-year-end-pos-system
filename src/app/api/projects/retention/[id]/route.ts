import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const schedule = await prisma.vendorRetentionSchedule.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, projectNo: true, description: true } },
      },
    })
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(schedule)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch retention schedule' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    // Release action: move heldAmount to releasedAmount
    const data = body.action === 'release'
      ? {
          releasedAmount: body.releaseAmount ?? 0,
          heldAmount:     Math.max(0, (body.currentHeld ?? 0) - (body.releaseAmount ?? 0)),
          status:         'released',
          releaseDate:    new Date(),
        }
      : body
    const schedule = await prisma.vendorRetentionSchedule.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(schedule)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update retention schedule' }, { status: 500 })
  }
}
