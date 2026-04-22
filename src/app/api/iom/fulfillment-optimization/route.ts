import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rules = await prisma.fulfillmentRule.findMany({
    orderBy: { priority: 'asc' },
  })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, ruleType, priority, description, conditionsJson, actionsJson } = body
  if (!name || !ruleType) return NextResponse.json({ error: 'name and ruleType required' }, { status: 400 })

  const rule = await prisma.fulfillmentRule.create({
    data: {
      name,
      ruleType,
      priority: priority ?? 1,
      description: description ?? null,
      conditionsJson: conditionsJson ? JSON.stringify(conditionsJson) : null,
      actionsJson: actionsJson ? JSON.stringify(actionsJson) : null,
    },
  })
  return NextResponse.json(rule, { status: 201 })
}
