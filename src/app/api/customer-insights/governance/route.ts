import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  const policies = await prisma.cIDataGovernancePolicy.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(policies)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const policy = await prisma.cIDataGovernancePolicy.create({
    data: {
      policyName: body.policyName,
      policyType: body.policyType ?? 'privacy',
      description: body.description ?? null,
      configJson: body.configJson ?? null,
      isEnabled: body.isEnabled ?? true,
    },
  })
  return NextResponse.json(policy, { status: 201 })
}
