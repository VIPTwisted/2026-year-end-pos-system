import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await prisma.compensationPlan.findUnique({
    where: { id },
    include: {
      grades: { include: { steps: { orderBy: { stepNo: 'asc' } } } },
      employeeComps: { include: { grade: true }, orderBy: { effectiveDate: 'desc' } },
    },
  })
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(plan)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const plan = await prisma.compensationPlan.update({
    where: { id },
    data: {
      description: body.description,
      type: body.type,
      currency: body.currency,
      isActive: body.isActive,
      effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
      expirationDate: body.expirationDate ? new Date(body.expirationDate) : undefined,
    },
  })
  return NextResponse.json(plan)
}
