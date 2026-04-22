import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const plans = await prisma.leavePlan.findMany({
    include: { leaveType: true, _count: { select: { enrollments: true } } },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const plan = await prisma.leavePlan.create({
    data: {
      code: body.code,
      name: body.name,
      leaveTypeId: body.leaveTypeId,
      accrualFrequency: body.accrualFrequency ?? 'monthly',
      accrualRate: body.accrualRate ?? 0,
      maxCarryover: body.maxCarryover ?? null,
      startMonth: body.startMonth ?? 1,
      resetType: body.resetType ?? 'calendar_year',
    },
    include: { leaveType: true },
  })
  return NextResponse.json(plan, { status: 201 })
}
