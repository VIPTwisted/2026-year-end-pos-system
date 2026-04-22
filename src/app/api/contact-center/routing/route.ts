import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rules = await prisma.routingRule.findMany({ orderBy: [{ priority: 'desc' }, { name: 'asc' }] })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rule = await prisma.routingRule.create({
    data: {
      name: body.name,
      channelType: body.channelType,
      priority: body.priority ?? 0,
      isActive: body.isActive ?? true,
      conditions: body.conditions ?? {},
      action: body.action ?? 'assign_queue',
      targetQueue: body.targetQueue ?? null,
      targetAgent: body.targetAgent ?? null,
    },
  })
  return NextResponse.json(rule, { status: 201 })
}
