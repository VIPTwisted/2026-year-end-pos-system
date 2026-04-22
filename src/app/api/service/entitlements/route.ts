import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')
  const status = searchParams.get('status')

  const entitlements = await prisma.entitlement.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      customer: true,
      sla: true,
      cases: { include: { customer: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(entitlements)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, customerId, type, totalTerms, startDate, endDate, slaId } = body
  if (!name || !customerId || !startDate) {
    return NextResponse.json({ error: 'name, customerId, startDate required' }, { status: 400 })
  }

  const entitlement = await prisma.entitlement.create({
    data: {
      name,
      customerId,
      type: type ?? 'cases',
      totalTerms: totalTerms ? parseInt(totalTerms) : null,
      remainingTerms: totalTerms ? parseInt(totalTerms) : null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: 'draft',
      slaId: slaId ?? null,
    },
    include: { customer: true, sla: true },
  })
  return NextResponse.json(entitlement, { status: 201 })
}
