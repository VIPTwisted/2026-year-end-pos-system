import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function generateReviewNo() {
  const year = new Date().getFullYear()
  const count = await prisma.performanceReview.count({
    where: { reviewNo: { startsWith: `REV-${year}-` } },
  })
  return `REV-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const status = searchParams.get('status')
  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (status) where.status = status
  const reviews = await prisma.performanceReview.findMany({
    where,
    include: { goals: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const reviewNo = await generateReviewNo()
  const review = await prisma.performanceReview.create({
    data: {
      reviewNo,
      employeeId: body.employeeId,
      reviewerId: body.reviewerId ?? null,
      reviewPeriodStart: new Date(body.reviewPeriodStart),
      reviewPeriodEnd: new Date(body.reviewPeriodEnd),
      status: 'draft',
      goals: body.goals
        ? {
            create: body.goals.map((g: Record<string, unknown>) => ({
              goalId: g.goalId as string ?? null,
              goalTitle: g.goalTitle as string,
              rating: null,
              comments: null,
            })),
          }
        : undefined,
    },
    include: { goals: true },
  })
  return NextResponse.json(review, { status: 201 })
}
