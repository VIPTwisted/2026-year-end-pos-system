import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const reviewPeriod = searchParams.get('period')
    const status = searchParams.get('status')

    const reviews = await prisma.performanceReview.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(reviewPeriod ? { reviewPeriod } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { reviewDate: 'desc' },
    })
    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch performance reviews' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const review = await prisma.performanceReview.create({ data: body })
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create performance review' }, { status: 500 })
  }
}
