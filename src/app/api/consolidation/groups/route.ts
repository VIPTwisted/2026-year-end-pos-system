import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const groups = await prisma.consolidationGroup.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      companies: true,
      runs: { orderBy: { runDate: 'desc' }, take: 1 },
    },
  })
  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  const group = await prisma.consolidationGroup.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      currency: body.currency || 'USD',
      periodStart: body.periodStart ? new Date(body.periodStart) : null,
      periodEnd: body.periodEnd ? new Date(body.periodEnd) : null,
    },
  })
  return NextResponse.json(group, { status: 201 })
}
