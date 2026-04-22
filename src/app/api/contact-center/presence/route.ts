import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const presences = await prisma.agentPresence.findMany({
    orderBy: { agentName: 'asc' },
  })
  return NextResponse.json(presences)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const presence = await prisma.agentPresence.upsert({
    where: { agentId: body.agentId },
    create: {
      agentId: body.agentId,
      agentName: body.agentName,
      status: body.status ?? 'offline',
      statusNote: body.statusNote ?? null,
      channelCapacities: body.channelCapacities ?? undefined,
      activeConversations: body.activeConversations ?? 0,
      lastUpdated: new Date(),
    },
    update: {
      agentName: body.agentName,
      status: body.status,
      statusNote: body.statusNote ?? null,
      channelCapacities: body.channelCapacities ?? undefined,
      activeConversations: body.activeConversations ?? 0,
      lastUpdated: new Date(),
    },
  })
  return NextResponse.json(presence)
}
