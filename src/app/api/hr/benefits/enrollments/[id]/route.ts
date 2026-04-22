import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const enrollment = await prisma.benefitEnrollment.findUnique({
    where: { id },
    include: { plan: true, dependents: true },
  })
  if (!enrollment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(enrollment)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.status) data.status = body.status
  if (body.terminationDate) data.terminationDate = new Date(body.terminationDate)
  if (body.coverageType) data.coverageType = body.coverageType
  if (body.employeeCost !== undefined) data.employeeCost = body.employeeCost
  if (body.employerCost !== undefined) data.employerCost = body.employerCost
  const enrollment = await prisma.benefitEnrollment.update({ where: { id }, data })
  return NextResponse.json(enrollment)
}
