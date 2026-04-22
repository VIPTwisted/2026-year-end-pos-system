import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const projects = await prisma.project.findMany({
    include: {
      invoices: true,
      actuals: true,
      budgetLines: true,
      tasks: { select: { percentComplete: true, budgetHours: true } },
    },
    orderBy: { projectNo: 'asc' },
  })

  // Also fetch contracts for contract value
  const contracts = await prisma.contract.findMany({
    include: { lines: true },
    where: { type: 'project' },
  })

  let totalContractValue = 0
  let totalRecognized = 0
  let totalDeferred = 0
  let totalUnbilled = 0

  const schedule = projects.map(p => {
    const contractAmount = Number(p.contractAmount)
    const totalInvoiced = p.invoices.reduce((s, inv) => s + Number(inv.amount), 0)
    const totalActualCost = p.actuals.reduce((s, a) => s + Number(a.amount), 0)

    // Percentage of completion based on hours
    const totalBudgetHours = p.tasks.reduce((s, t) => s + Number(t.budgetHours), 0)
    const earnedHours = p.tasks.reduce(
      (s, t) => s + (Number(t.budgetHours) * Number(t.percentComplete)) / 100,
      0,
    )
    const pctComplete =
      totalBudgetHours > 0 ? Math.min(100, (earnedHours / totalBudgetHours) * 100) : 0

    // Earned value (% of completion * contract)
    const earnedValue = (pctComplete / 100) * contractAmount
    // Recognized = min of earned value and contract amount
    const recognizedToDate = Math.min(earnedValue, contractAmount)
    // Deferred = contract collected - recognized
    const deferred = Math.max(0, totalInvoiced - recognizedToDate)
    // Unbilled = earned but not yet invoiced
    const unbilled = Math.max(0, recognizedToDate - totalInvoiced)
    // Overage = recognized > contract
    const overage = Math.max(0, recognizedToDate - contractAmount)

    // Link to contract if any (by customer)
    const linked = contracts.filter(c => c.customerId === p.customerId)
    const contractValue = linked.reduce((s, c) => s + Number(c.value), 0) || contractAmount

    totalContractValue += contractValue
    totalRecognized += recognizedToDate
    totalDeferred += deferred
    totalUnbilled += unbilled

    return {
      projectId: p.id,
      projectNo: p.projectNo,
      description: p.description,
      status: p.status,
      contractValue,
      contractAmount,
      pctComplete: Math.round(pctComplete * 10) / 10,
      earnedValue: Math.round(earnedValue * 100) / 100,
      recognizedToDate: Math.round(recognizedToDate * 100) / 100,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      deferred: Math.round(deferred * 100) / 100,
      unbilled: Math.round(unbilled * 100) / 100,
      overage: Math.round(overage * 100) / 100,
      totalActualCost: Math.round(totalActualCost * 100) / 100,
      wipMethod: p.wipMethod,
    }
  })

  return NextResponse.json({
    kpis: {
      totalContractValue: Math.round(totalContractValue * 100) / 100,
      totalRecognized: Math.round(totalRecognized * 100) / 100,
      totalDeferred: Math.round(totalDeferred * 100) / 100,
      totalUnbilled: Math.round(totalUnbilled * 100) / 100,
    },
    schedule,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, method, periodEndDate } = body as {
      projectId: string
      method: string
      periodEndDate: string
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        actuals: true,
        invoices: true,
        tasks: { select: { percentComplete: true, budgetHours: true } },
        budgetLines: true,
      },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const contractAmount = Number(project.contractAmount)
    const totalInvoiced = project.invoices.reduce((s, inv) => s + Number(inv.amount), 0)
    const totalActualCost = project.actuals
      .filter(a => new Date(a.date) <= new Date(periodEndDate))
      .reduce((s, a) => s + Number(a.amount), 0)
    const totalBudget = Number(project.budgetAmount) || 1

    let recognizedPct = 0
    if (method === 'percentage_of_completion') {
      recognizedPct = Math.min(100, (totalActualCost / totalBudget) * 100)
    } else if (method === 'completed_contract') {
      recognizedPct = project.status === 'completed' ? 100 : 0
    } else if (method === 'milestone_based') {
      const totalBudgetHours = project.tasks.reduce((s, t) => s + Number(t.budgetHours), 0)
      const earned = project.tasks.reduce(
        (s, t) => s + (Number(t.budgetHours) * Number(t.percentComplete)) / 100,
        0,
      )
      recognizedPct = totalBudgetHours > 0 ? (earned / totalBudgetHours) * 100 : 0
    }

    const recognizedAmount = (recognizedPct / 100) * contractAmount
    const deferred = Math.max(0, totalInvoiced - recognizedAmount)
    const unbilled = Math.max(0, recognizedAmount - totalInvoiced)

    return NextResponse.json({
      projectId,
      method,
      periodEndDate,
      contractAmount,
      recognizedPct: Math.round(recognizedPct * 10) / 10,
      recognizedAmount: Math.round(recognizedAmount * 100) / 100,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      deferred: Math.round(deferred * 100) / 100,
      unbilled: Math.round(unbilled * 100) / 100,
    })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Recognition run failed' }, { status: 500 })
  }
}
