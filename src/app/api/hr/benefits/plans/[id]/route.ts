import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await prisma.benefitPlan.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { dependents: true },
        orderBy: { effectiveDate: 'desc' },
      },
    },
  })
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(plan)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const plan = await prisma.benefitPlan.update({
    where: { id },
    data: {
      name: body.name,
      planType: body.planType,
      description: body.description,
      carrier: body.carrier,
      isActive: body.isActive,
      employeeCost: body.employeeCost,
      employerCost: body.employerCost,
      coverageTypes: body.coverageTypes ? JSON.stringify(body.coverageTypes) : undefined,
      waitingPeriodDays: body.waitingPeriodDays,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    },
  })
  return NextResponse.json(plan)
}
