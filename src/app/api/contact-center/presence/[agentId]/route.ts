import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const presence = await prisma.agentPresence.findUnique({ where: { agentId } })
  if (!presence) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(presence)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const body = await req.json()
  const presence = await prisma.agentPresence.upsert({
    where: { agentId },
    create: {
      agentId,
      agentName: body.agentName ?? agentId,
      status: body.status ?? 'offline',
      statusNote: body.statusNote ?? null,
      channelCapacities: body.channelCapacities ?? undefined,
      activeConversations: body.activeConversations ?? 0,
      lastUpdated: new Date(),
    },
    update: {
      status: body.status,
      statusNote: body.statusNote ?? null,
      channelCapacities: body.channelCapacities ?? undefined,
      activeConversations: body.activeConversations,
      lastUpdated: new Date(),
    },
  })
  return NextResponse.json(presence)
}
