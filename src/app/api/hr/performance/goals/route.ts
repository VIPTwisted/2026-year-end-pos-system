import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (status) where.status = status
  if (category) where.category = category
  const goals = await prisma.performanceGoal.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const goal = await prisma.performanceGoal.create({
    data: {
      employeeId: body.employeeId,
      title: body.title,
      description: body.description ?? null,
      category: body.category ?? 'performance',
      status: body.status ?? 'in_progress',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      weight: body.weight ?? 0,
      targetMeasure: body.targetMeasure ?? null,
      actualMeasure: body.actualMeasure ?? null,
    },
  })
  return NextResponse.json(goal, { status: 201 })
}
