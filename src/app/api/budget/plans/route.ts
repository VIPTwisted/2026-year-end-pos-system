import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/budget/plans
// GET /api/budget/plans?accounts=1  — return accounts list for the new-plan form
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  if (searchParams.get('accounts') === '1') {
    const accounts = await prisma.account.findMany({
      where: { type: { in: ['revenue', 'expense'] } },
      select: { id: true, code: true, name: true, type: true },
      orderBy: { code: 'asc' },
    })
    return NextResponse.json({ accounts })
  }

  const plans = await prisma.budgetPlan.findMany({
    include: {
      _count: { select: { entries: true } },
      entries: { select: { budgetAmount: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const data = plans.map(p => ({
    ...p,
    totalBudgeted: p.entries.reduce((s, e) => s + Number(e.budgetAmount), 0),
  }))

  return NextResponse.json(data)
}

// POST /api/budget/plans
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, fiscalYear, description, entries = [] } = body

    if (!code || !name || !fiscalYear) {
      return NextResponse.json(
        { error: 'code, name, and fiscalYear are required' },
        { status: 400 }
      )
    }

    const plan = await prisma.budgetPlan.create({
      data: {
        code,
        name,
        fiscalYear,
        description: description || null,
        status: 'draft',
        entries: {
          create: entries
            .filter((e: { budgetAmount?: number }) => e.budgetAmount && Number(e.budgetAmount) > 0)
            .map((e: { accountId: string; budgetAmount: number; periodNumber?: number | null }) => ({
              accountId: e.accountId,
              budgetAmount: Number(e.budgetAmount),
              periodNumber: e.periodNumber ?? null,
            })),
        },
      },
      include: {
        _count: { select: { entries: true } },
        entries: { select: { budgetAmount: true } },
      },
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A budget plan with that code already exists.' }, { status: 409 })
    }
    console.error('[POST /api/budget/plans]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
