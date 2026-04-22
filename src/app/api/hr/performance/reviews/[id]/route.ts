import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const review = await prisma.performanceReview.findUnique({
    where: { id },
    include: { goals: true },
  })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(review)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}

  const statusFlow: Record<string, string> = {
    start: 'in_progress',
    submit: 'employee_review',
    manager_review: 'manager_review',
    complete: 'completed',
  }

  if (body.action && statusFlow[body.action]) {
    data.status = statusFlow[body.action]
    if (body.action === 'complete') data.completedAt = new Date()
  }
  if (body.status) data.status = body.status
  if (body.overallRating !== undefined) data.overallRating = body.overallRating
  if (body.employeeComments !== undefined) data.employeeComments = body.employeeComments
  if (body.managerComments !== undefined) data.managerComments = body.managerComments

  // Update goal ratings if provided
  if (body.goalRatings) {
    for (const gr of body.goalRatings as { id: string; rating: number; comments: string }[]) {
      await prisma.performanceGoalReview.update({
        where: { id: gr.id },
        data: { rating: gr.rating, comments: gr.comments },
      })
    }
  }

  const review = await prisma.performanceReview.update({
    where: { id },
    data,
    include: { goals: true },
  })
  return NextResponse.json(review)
}
