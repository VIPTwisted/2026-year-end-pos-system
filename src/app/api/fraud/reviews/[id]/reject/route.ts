import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const review = await prisma.fraudReview.update({
    where: { id },
    data: { status: 'rejected', reviewedAt: new Date() },
  })
  return NextResponse.json(review)
}
