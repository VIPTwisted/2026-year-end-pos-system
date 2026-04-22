import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const where = employeeId ? { employeeId } : {}
  const comps = await prisma.employeeCompensation.findMany({
    where,
    include: {
      plan: true,
      grade: true,
    },
    orderBy: { effectiveDate: 'desc' },
  })
  return NextResponse.json(comps)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const comp = await prisma.employeeCompensation.create({
    data: {
      employeeId: body.employeeId,
      planId: body.planId,
      gradeId: body.gradeId ?? null,
      stepNo: body.stepNo ?? null,
      amount: body.amount,
      currency: body.currency ?? 'USD',
      payFrequency: body.payFrequency ?? 'biweekly',
      effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : new Date(),
      reason: body.reason ?? null,
    },
    include: { plan: true, grade: true },
  })
  return NextResponse.json(comp, { status: 201 })
}
