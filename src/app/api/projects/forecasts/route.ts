import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const projects = await prisma.project.findMany({
    where: status ? { status } : undefined,
    include: {
      tasks: { select: { budgetHours: true, actualHours: true, percentComplete: true } },
      planningLines: { select: { lineAmount: true, lineType: true } },
      actuals: { select: { amount: true, hours: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const result = projects.map(p => {
    const budgetCost = p.planningLines.reduce((s, l) => s + l.lineAmount, 0) || p.budgetAmount
    const actualCost = p.actuals.reduce((s, a) => s + a.amount, 0)
    const variance = budgetCost - actualCost
    const totalTasks = p.tasks.length
    const completionPct = totalTasks > 0
      ? Math.round(p.tasks.reduce((s, t) => s + t.percentComplete, 0) / totalTasks)
      : 0
    const forecastCost = actualCost + (budgetCost - actualCost) * (1 - completionPct / 100)

    return {
      id: p.id,
      projectNo: p.projectNo,
      description: p.description,
      status: p.status,
      budget: budgetCost,
      forecastCost,
      actualCost,
      variance,
      completionPct,
    }
  })

  return NextResponse.json(result)
}
