import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/budget/plans/[id]/lines
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const plan = await prisma.budgetPlan.findUnique({ where: { id } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const entries = await prisma.budgetEntry.findMany({
      where: { budgetPlanId: id },
      include: {
        account: { select: { id: true, code: true, name: true, type: true, balance: true } },
      },
      orderBy: { account: { code: 'asc' } },
    })

    return NextResponse.json(entries)
  } catch (e) {
    console.error('[GET /api/budget/plans/[id]/lines]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/budget/plans/[id]/lines
// Body: { glAccountId, amount, period?, description? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      glAccountId?: string
      amount?: number
      period?: number | null
      description?: string
    }

    const { glAccountId, amount, period, description } = body

    if (!glAccountId || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'glAccountId and amount are required' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'amount must be a non-negative number' },
        { status: 400 }
      )
    }

    const plan = await prisma.budgetPlan.findUnique({ where: { id } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const account = await prisma.account.findUnique({ where: { id: glAccountId } })
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const entry = await prisma.budgetEntry.create({
      data: {
        budgetPlanId: id,
        accountId: glAccountId,
        budgetAmount: amount,
        periodNumber: period ?? null,
        notes: description ?? null,
      },
      include: {
        account: { select: { id: true, code: true, name: true, type: true, balance: true } },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A budget entry for this account and period already exists on this plan.' },
        { status: 409 }
      )
    }
    console.error('[POST /api/budget/plans/[id]/lines]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
