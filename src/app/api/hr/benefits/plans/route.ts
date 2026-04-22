import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const planType = searchParams.get('planType')
  const where = planType ? { planType } : {}
  const plans = await prisma.benefitPlan.findMany({
    where,
    include: { _count: { select: { enrollments: true } } },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const plan = await prisma.benefitPlan.create({
    data: {
      code: body.code,
      name: body.name,
      planType: body.planType,
      description: body.description ?? null,
      carrier: body.carrier ?? null,
      isActive: body.isActive ?? true,
      employeeCost: body.employeeCost ?? 0,
      employerCost: body.employerCost ?? 0,
      coverageTypes: body.coverageTypes ? JSON.stringify(body.coverageTypes) : null,
      waitingPeriodDays: body.waitingPeriodDays ?? 0,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })
  return NextResponse.json(plan, { status: 201 })
}
