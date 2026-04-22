import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rules = await prisma.fulfillmentRule.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rule = await prisma.fulfillmentRule.create({
    data: {
      name: body.name,
      description: body.description || undefined,
      ruleType: body.ruleType,
      priority: body.priority ?? 0,
      isActive: body.isActive ?? true,
      conditions: body.conditions || undefined,
    },
  })
  return NextResponse.json(rule, { status: 201 })
}
