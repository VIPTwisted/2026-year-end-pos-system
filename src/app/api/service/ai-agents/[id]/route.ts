import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const agent = await prisma.serviceAIAgent.findUnique({ where: { id: params.id } })
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(agent)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const agent = await prisma.serviceAIAgent.update({
    where: { id: params.id },
    data: {
      ...(body.name           !== undefined && { name:           body.name }),
      ...(body.agentType      !== undefined && { agentType:      body.agentType }),
      ...(body.status         !== undefined && { status:         body.status }),
      ...(body.modelConfig    !== undefined && { modelConfig:    body.modelConfig }),
      ...(body.promptSystem   !== undefined && { promptSystem:   body.promptSystem }),
      ...(body.channels       !== undefined && { channels:       body.channels }),
      ...(body.escalationRule !== undefined && { escalationRule: body.escalationRule }),
      ...(body.casesHandled   !== undefined && { casesHandled:   body.casesHandled }),
      ...(body.resolutionRate !== undefined && { resolutionRate: body.resolutionRate }),
    },
  })
  return NextResponse.json(agent)
}
