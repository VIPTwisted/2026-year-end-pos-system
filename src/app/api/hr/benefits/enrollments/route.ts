import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const status = searchParams.get('status')
  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (status) where.status = status
  const enrollments = await prisma.benefitEnrollment.findMany({
    where,
    include: { plan: true, dependents: true },
    orderBy: { effectiveDate: 'desc' },
  })
  return NextResponse.json(enrollments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const plan = await prisma.benefitPlan.findUnique({ where: { id: body.planId } })
  const enrollment = await prisma.benefitEnrollment.create({
    data: {
      employeeId: body.employeeId,
      planId: body.planId,
      coverageType: body.coverageType ?? 'employee_only',
      employeeCost: body.employeeCost ?? plan?.employeeCost ?? 0,
      employerCost: body.employerCost ?? plan?.employerCost ?? 0,
      status: 'active',
      effectiveDate: new Date(body.effectiveDate),
      terminationDate: body.terminationDate ? new Date(body.terminationDate) : null,
      dependents: body.dependents
        ? {
            create: body.dependents.map((d: Record<string, unknown>) => ({
              firstName: d.firstName as string,
              lastName: d.lastName as string,
              relationship: d.relationship as string,
              dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth as string) : null,
              ssn: d.ssn ?? null,
              isStudent: d.isStudent ?? false,
            })),
          }
        : undefined,
    },
    include: { plan: true, dependents: true },
  })
  return NextResponse.json(enrollment, { status: 201 })
}
