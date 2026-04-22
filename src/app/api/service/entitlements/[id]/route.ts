import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const entitlement = await prisma.entitlement.findUnique({
    where: { id },
    include: {
      customer: true,
      sla: true,
      cases: { include: { customer: true } },
    },
  })
  if (!entitlement) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(entitlement)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, name, endDate, totalTerms, remainingTerms, slaId } = body

  const entitlement = await prisma.entitlement.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
      ...(totalTerms !== undefined ? { totalTerms: totalTerms ? parseInt(totalTerms) : null } : {}),
      ...(remainingTerms !== undefined ? { remainingTerms: remainingTerms ? parseInt(remainingTerms) : null } : {}),
      ...(slaId !== undefined ? { slaId } : {}),
    },
    include: { customer: true, sla: true, cases: true },
  })
  return NextResponse.json(entitlement)
}
