import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
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
      include: { employee: { select: { firstName: true, lastName: true } } },
    })
    return NextResponse.json(goals)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.employeeId || !body.title) {
      return NextResponse.json({ error: 'employeeId and title are required' }, { status: 400 })
    }

    const goal = await prisma.performanceGoal.create({
      data: {
        employeeId: body.employeeId,
        title: body.title,
        description: body.description ?? null,
        category: body.category ?? 'individual',
        priority: body.priority ?? 'medium',
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        reviewCycleId: body.reviewCycleId ?? null,
        status: 'active',
        progressPct: 0,
      },
    })
    return NextResponse.json(goal, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
