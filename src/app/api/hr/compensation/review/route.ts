import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const cycleId = searchParams.get('cycleId')

  try {
    const reviews = await prisma.compensationReview.findMany({
      where: {
        ...(status  ? { status }  : {}),
        ...(cycleId ? { cycleId } : {}),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: 'Compensation reviews unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const review = await prisma.compensationReview.create({ data: body })
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
