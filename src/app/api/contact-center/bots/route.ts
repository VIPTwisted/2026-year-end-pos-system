import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const bots = await prisma.contactCenterBot.findMany({
    include: { _count: { select: { intents: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(bots)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const bot = await prisma.contactCenterBot.create({
    data: {
      name: body.name,
      type: body.type ?? 'rule_based',
      channelType: body.channelType,
      isActive: body.isActive ?? true,
      handoffCondition: body.handoffCondition ?? 'customer_request',
      greetingMessage: body.greetingMessage ?? null,
      escalationMessage: body.escalationMessage ?? null,
    },
  })
  return NextResponse.json(bot, { status: 201 })
}
