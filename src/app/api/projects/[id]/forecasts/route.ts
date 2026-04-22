import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const [project, budgetLines, actuals] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        projectNo: true,
        description: true,
        contractAmount: true,
        budgetAmount: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    }),
    prisma.projectBudgetLine.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.projectActual.findMany({
      where: { projectId: id },
      orderBy: { date: 'asc' },
    }),
  ])

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Aggregate budget by lineType
  const budgetByType: Record<string, { budget: number; actual: number }> = {}
  for (const line of budgetLines) {
    if (!budgetByType[line.lineType]) {
      budgetByType[line.lineType] = { budget: 0, actual: 0 }
    }
    budgetByType[line.lineType].budget += Number(line.budgetAmount)
  }

  // Aggregate actuals by type
  for (const actual of actuals) {
    const t = actual.type
    if (!budgetByType[t]) {
      budgetByType[t] = { budget: 0, actual: 0 }
    }
    budgetByType[t].actual += Number(actual.amount)
  }

  const totalBudget = Object.values(budgetByType).reduce((s, r) => s + r.budget, 0)
  const totalActual = Object.values(budgetByType).reduce((s, r) => s + r.actual, 0)

  // Earned Value Metrics
  // Planned Value = budget amount (BAC)
  const bac = Number(project.budgetAmount) || totalBudget
  const actualCost = totalActual

  // EV based on % complete (sum of weighted task completion)
  const tasks = await prisma.projectTask.findMany({
    where: { projectId: id },
    select: { percentComplete: true, budgetHours: true },
  })
  const totalBudgetHours = tasks.reduce((s, t) => s + Number(t.budgetHours), 0)
  const earnedHours = tasks.reduce(
    (s, t) => s + (Number(t.budgetHours) * Number(t.percentComplete)) / 100,
    0,
  )
  const percentComplete = totalBudgetHours > 0 ? (earnedHours / totalBudgetHours) * 100 : 0

  const pv = bac // planned value = BAC (simplified; full EV needs schedule baseline)
  const ev = (percentComplete / 100) * bac
  const cpi = ev > 0 ? ev / actualCost : 0
  const spi = pv > 0 ? ev / pv : 0
  const eac = cpi > 0 ? bac / cpi : bac - ev + actualCost
  const etc = eac - actualCost
  const vac = bac - eac

  const categories = Object.entries(budgetByType).map(([type, values]) => ({
    type,
    budget: values.budget,
    actual: values.actual,
    variance: values.budget - values.actual,
    variancePct: values.budget > 0 ? ((values.budget - values.actual) / values.budget) * 100 : 0,
    remaining: Math.max(0, values.budget - values.actual),
    eac: values.budget > 0 && cpi > 0 ? values.budget / cpi : values.actual,
  }))

  return NextResponse.json({
    project,
    metrics: {
      bac,
      ev: Math.round(ev * 100) / 100,
      pv: Math.round(pv * 100) / 100,
      actualCost: Math.round(actualCost * 100) / 100,
      cpi: Math.round(cpi * 1000) / 1000,
      spi: Math.round(spi * 1000) / 1000,
      eac: Math.round(eac * 100) / 100,
      etc: Math.round(etc * 100) / 100,
      vac: Math.round(vac * 100) / 100,
      percentComplete: Math.round(percentComplete * 10) / 10,
    },
    categories,
    budgetLines,
    actuals,
  })
}
