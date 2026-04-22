import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const policies = await prisma.fulfillmentPolicy.findMany({
    orderBy: [{ priority: 'desc' }, { name: 'asc' }],
  })
  return NextResponse.json(policies)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const policy = await prisma.fulfillmentPolicy.create({
    data: {
      name: body.name,
      description: body.description || null,
      isActive: body.isActive ?? true,
      priority: body.priority ?? 0,
      optimizeFor: body.optimizeFor ?? 'cost',
      conditions: body.conditions || null,
      providerPreferences: body.providerPreferences || null,
      maxSplitLines: body.maxSplitLines ?? 1,
    },
  })
  return NextResponse.json(policy, { status: 201 })
}
