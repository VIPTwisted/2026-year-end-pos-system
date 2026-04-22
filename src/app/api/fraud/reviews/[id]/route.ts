import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const review = await prisma.fraudReview.update({
    where: { id },
    data: {
      status: body.status,
      reviewedBy: body.reviewedBy,
      reviewedAt: body.reviewedAt ? new Date(body.reviewedAt) : undefined,
      notes: body.notes,
    },
  })
  return NextResponse.json(review)
}
