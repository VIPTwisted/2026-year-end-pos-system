import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rules = await prisma.fraudRule.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rule = await prisma.fraudRule.create({
    data: {
      ruleName: body.ruleName,
      description: body.description ?? null,
      ruleType: body.ruleType,
      conditionJson: body.conditionJson ?? null,
      riskScore: body.riskScore ?? 50,
      action: body.action ?? 'review',
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(rule, { status: 201 })
}
