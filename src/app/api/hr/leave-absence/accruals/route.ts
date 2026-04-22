import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const isActive = searchParams.get('isActive')

  const plans = await prisma.leaveAccrualPlan.findMany({
    where: {
      ...(isActive != null ? { isActive: isActive === 'true' } : {}),
    },
    include: { enrollments: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name, leaveTypeId, accrualFrequency, accrualAmount,
    maxBalance, carryOverLimit, waitingPeriodDays, isActive,
  } = body

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const plan = await prisma.leaveAccrualPlan.create({
    data: {
      name,
      leaveTypeId: leaveTypeId ?? null,
      accrualFrequency: accrualFrequency ?? 'monthly',
      accrualAmount: accrualAmount ?? 0,
      maxBalance: maxBalance ?? null,
      carryOverLimit: carryOverLimit ?? null,
      waitingPeriodDays: waitingPeriodDays ?? 0,
      isActive: isActive ?? true,
    },
  })
  return NextResponse.json(plan, { status: 201 })
}
