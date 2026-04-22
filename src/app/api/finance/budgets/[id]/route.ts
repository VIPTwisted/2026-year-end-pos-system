import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const budget = await prisma.budgetPlan.findUnique({
    where: { id },
    include: {
      entries: {
        include: { account: { select: { id: true, code: true, name: true, type: true } } },
        orderBy: [{ account: { code: 'asc' } }, { periodNumber: 'asc' }],
      },
    },
  })

  if (!budget) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const accounts = await prisma.account.findMany({
    where: { isActive: true, type: { in: ['revenue', 'expense'] } },
    orderBy: { code: 'asc' },
    select: { id: true, code: true, name: true, type: true },
  })

  const entryMap = new Map<string, number>()
  for (const e of budget.entries) {
    entryMap.set(`${e.accountId}::${e.periodNumber ?? 0}`, e.budgetAmount)
  }

  const grid = accounts.map((acct) => {
    const months: number[] = []
    for (let m = 1; m <= 12; m++) {
      months.push(entryMap.get(`${acct.id}::${m}`) ?? 0)
    }
    const annual = entryMap.get(`${acct.id}::0`) ?? months.reduce((s, v) => s + v, 0)
    return { accountId: acct.id, accountNo: acct.code, accountName: acct.name, type: acct.type, months, annual }
  })

  return NextResponse.json({ budget: { ...budget, entries: undefined }, grid })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body   = await req.json()

  if (Array.isArray(body.entries)) {
    for (const e of body.entries) {
      await prisma.budgetEntry.upsert({
        where: {
          budgetPlanId_accountId_periodNumber: {
            budgetPlanId: id,
            accountId:    e.accountId,
            periodNumber: e.periodNumber ?? 0,
          },
        },
        update:  { budgetAmount: e.budgetAmount },
        create: {
          budgetPlanId: id,
          accountId:    e.accountId,
          periodNumber: e.periodNumber ?? 0,
          budgetAmount: e.budgetAmount,
        },
      })
    }
  }

  const data: Record<string, unknown> = {}
  if (body.name        !== undefined) data.name   = body.name
  if (body.status      !== undefined) data.status = body.status
  if (body.description !== undefined) data.description = body.description

  if (Object.keys(data).length > 0) {
    await prisma.budgetPlan.update({ where: { id }, data })
  }

  return NextResponse.json({ ok: true })
}
