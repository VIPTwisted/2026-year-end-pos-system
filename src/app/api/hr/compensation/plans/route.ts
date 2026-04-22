import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const where = type ? { type } : {}
  const plans = await prisma.compensationPlan.findMany({
    where,
    include: {
      _count: { select: { grades: true, employeeComps: true } },
    },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const plan = await prisma.compensationPlan.create({
    data: {
      code: body.code,
      description: body.description,
      type: body.type ?? 'fixed',
      currency: body.currency ?? 'USD',
      isActive: body.isActive ?? true,
      effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
      expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
    },
  })
  return NextResponse.json(plan, { status: 201 })
}
