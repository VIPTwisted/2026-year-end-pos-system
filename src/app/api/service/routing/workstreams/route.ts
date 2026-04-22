import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const channel  = searchParams.get('channel')
  const isActive = searchParams.get('isActive')

  const where: Record<string, unknown> = {}
  if (channel)             where.channel  = channel
  if (isActive !== null)   where.isActive = isActive === 'true'

  const workstreams = await prisma.serviceWorkstream.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(workstreams)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const ws = await prisma.serviceWorkstream.create({
    data: {
      name:           body.name,
      channel:        body.channel        ?? 'chat',
      capacity:       Number(body.capacity ?? 5),
      routingMode:    body.routingMode    ?? 'round_robin',
      sessionTimeout: Number(body.sessionTimeout ?? 30),
      isActive:       body.isActive       ?? true,
      skillsRequired: body.skillsRequired ?? null,
      queueId:        body.queueId        ?? null,
    },
  })
  return NextResponse.json(ws, { status: 201 })
}
