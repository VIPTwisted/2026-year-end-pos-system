import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const review = await prisma.productReview.update({
    where: { id },
    data: { status: 'rejected', moderatedAt: new Date() },
  })
  return NextResponse.json(review)
}
