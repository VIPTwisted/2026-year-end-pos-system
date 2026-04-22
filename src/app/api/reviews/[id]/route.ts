import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const review = await prisma.productReview.findUnique({ where: { id } })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(review)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const review = await prisma.productReview.update({
    where: { id },
    data: {
      status: body.status,
      moderatedBy: body.moderatedBy,
      moderatedAt: body.moderatedAt ? new Date(body.moderatedAt) : undefined,
      helpfulVotes: body.helpfulVotes,
      reportCount: body.reportCount,
    },
  })
  return NextResponse.json(review)
}
