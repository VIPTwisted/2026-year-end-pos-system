import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const rule = await prisma.fraudRule.update({
    where: { id },
    data: {
      ruleName: body.ruleName,
      description: body.description,
      ruleType: body.ruleType,
      conditionJson: body.conditionJson,
      riskScore: body.riskScore,
      action: body.action,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(rule)
}
