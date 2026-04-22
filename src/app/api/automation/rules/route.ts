import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const entity = req.nextUrl.searchParams.get('entity')
  const rules = await prisma.businessRule.findMany({
    where: entity && entity !== 'all' ? { entity } : undefined,
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name || !body.entity) return NextResponse.json({ error: 'name and entity required' }, { status: 400 })
  const rule = await prisma.businessRule.create({
    data: {
      name: body.name,
      entity: body.entity,
      ruleType: body.ruleType ?? 'validation',
      conditions: JSON.stringify(body.conditions ?? []),
      action: JSON.stringify(body.action ?? {}),
      priority: body.priority ?? 0,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(rule, { status: 201 })
}
