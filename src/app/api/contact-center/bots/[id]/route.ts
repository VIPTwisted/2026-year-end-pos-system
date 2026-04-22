import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bot = await prisma.contactCenterBot.findUnique({
    where: { id },
    include: { intents: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!bot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(bot)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const bot = await prisma.contactCenterBot.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      channelType: body.channelType,
      isActive: body.isActive,
      handoffCondition: body.handoffCondition,
      greetingMessage: body.greetingMessage,
      escalationMessage: body.escalationMessage,
    },
    include: { intents: { orderBy: { sortOrder: 'asc' } } },
  })
  return NextResponse.json(bot)
}
