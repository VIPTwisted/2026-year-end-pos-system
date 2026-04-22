import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fiscalYear = searchParams.get('fiscalYear')
  const status     = searchParams.get('status')
  const search     = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (fiscalYear) where.fiscalYear = fiscalYear
  if (status)     where.status     = status
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
    ]
  }

  const budgets = await prisma.budgetPlan.findMany({
    where,
    include: {
      entries: {
        include: { account: { select: { balance: true } } },
      },
      _count: { select: { entries: true } },
    },
    orderBy: [{ fiscalYear: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json(budgets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!body.fiscalYear?.trim()) {
    return NextResponse.json({ error: 'fiscalYear is required (e.g. FY2026)' }, { status: 400 })
  }

  const code = body.code?.trim() ||
    `${body.fiscalYear.trim().toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

  const existing = await prisma.budgetPlan.findFirst({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: `Budget code "${code}" is already in use` }, { status: 409 })
  }

  const budget = await prisma.budgetPlan.create({
    data: {
      code,
      name:        body.name.trim(),
      fiscalYear:  body.fiscalYear.trim(),
      description: body.description?.trim() ?? null,
      status:      body.status ?? 'draft',
    },
  })

  return NextResponse.json(budget, { status: 201 })
}
