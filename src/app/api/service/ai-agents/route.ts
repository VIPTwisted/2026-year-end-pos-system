import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status    = searchParams.get('status')
  const agentType = searchParams.get('agentType')

  const where: Record<string, unknown> = {}
  if (status && status !== 'all')       where.status    = status
  if (agentType && agentType !== 'all') where.agentType = agentType

  const agents = await prisma.serviceAIAgent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(agents)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const agent = await prisma.serviceAIAgent.create({
    data: {
      name:           body.name,
      agentType:      body.agentType      ?? 'case',
      status:         body.status         ?? 'inactive',
      modelConfig:    body.modelConfig    ?? null,
      promptSystem:   body.promptSystem   ?? null,
      channels:       body.channels       ?? null,
      escalationRule: body.escalationRule ?? null,
    },
  })
  return NextResponse.json(agent, { status: 201 })
}
