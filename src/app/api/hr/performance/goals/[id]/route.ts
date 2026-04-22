import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const goal = await prisma.performanceGoal.findUnique({
      where: { id },
      include: { employee: { select: { firstName: true, lastName: true } } },
    })
    if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(goal)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.action === 'complete') {
      data.status = 'completed'
      data.completedDate = new Date()
    } else if (body.action === 'cancel') {
      data.status = 'cancelled'
    } else {
      if (body.title !== undefined) data.title = body.title
      if (body.description !== undefined) data.description = body.description
      if (body.category !== undefined) data.category = body.category
      if (body.priority !== undefined) data.priority = body.priority
      if (body.status !== undefined) {
        data.status = body.status
        if (body.status === 'completed') data.completedDate = new Date()
      }
      if (body.progressPct !== undefined) data.progressPct = body.progressPct
      if (body.targetDate !== undefined) data.targetDate = body.targetDate ? new Date(body.targetDate) : null
      if (body.notes !== undefined) data.notes = body.notes
      if (body.reviewCycleId !== undefined) data.reviewCycleId = body.reviewCycleId ?? null
    }

    const goal = await prisma.performanceGoal.update({ where: { id }, data })
    return NextResponse.json(goal)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
