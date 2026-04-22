import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isActiveParam = searchParams.get('isActive')
    const ruleType = searchParams.get('ruleType')

    const where: Record<string, unknown> = {}
    if (isActiveParam !== null) where.isActive = isActiveParam === 'true'
    if (ruleType) where.ruleType = ruleType

    const rules = await prisma.priceRule.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(rules)
  } catch (error) {
    console.error('GET /api/pricing/rules error:', error)
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, description, ruleType, conditionJson, actionJson,
      customerGroup, priority, stackable, validFrom, validTo, usageLimit,
    } = body
    if (!name || !ruleType) {
      return NextResponse.json({ error: 'name and ruleType are required' }, { status: 400 })
    }
    const rule = await prisma.priceRule.create({
      data: {
        name,
        description: description ?? null,
        ruleType,
        conditionJson: conditionJson ?? null,
        actionJson: actionJson ?? null,
        customerGroup: customerGroup ?? null,
        priority: priority ?? 0,
        stackable: stackable ?? false,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        usageLimit: usageLimit ?? null,
      },
    })
    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('POST /api/pricing/rules error:', error)
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}
