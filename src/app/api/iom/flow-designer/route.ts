import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const flows = await prisma.orchestrationFlow.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { runs: true } },
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 1,
        select: { startedAt: true, status: true },
      },
    },
  })
  return NextResponse.json(flows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, triggerType, stepsJson, conditionsJson } = body
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const flow = await prisma.orchestrationFlow.create({
    data: {
      name,
      description: description ?? null,
      triggerType: triggerType ?? 'order_created',
      stepsJson: stepsJson ? JSON.stringify(stepsJson) : null,
      conditionsJson: conditionsJson ? JSON.stringify(conditionsJson) : null,
    },
  })
  return NextResponse.json(flow, { status: 201 })
}
