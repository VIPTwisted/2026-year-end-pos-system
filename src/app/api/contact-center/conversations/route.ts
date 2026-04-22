import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function buildConvNo(seq: number) {
  const year = new Date().getFullYear()
  return `CONV-${year}-${String(seq).padStart(4, '0')}`
}

async function applyRoutingRules(channelType: string, customerId?: string) {
  const rules = await prisma.routingRule.findMany({
    where: { isActive: true, channelType: { in: [channelType, 'any'] } },
    orderBy: { priority: 'desc' },
  })
  for (const rule of rules) {
    return { queueId: rule.targetQueue ?? null, agentName: rule.targetAgent ?? null }
  }
  return { queueId: null, agentName: null }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const channelId = searchParams.get('channelId')
  const agentId = searchParams.get('agentId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const summary = searchParams.get('summary') === 'true'

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (channelId) where.channelId = channelId
  if (agentId) where.assignedAgentId = agentId
  if (from || to) {
    where.startedAt = {}
    if (from) (where.startedAt as Record<string, unknown>).gte = new Date(from)
    if (to) (where.startedAt as Record<string, unknown>).lte = new Date(to)
  }

  if (summary) {
    const [total, waiting, abandoned, activeList, csatData] = await Promise.all([
      prisma.conversation.count({ where }),
      prisma.conversation.count({ where: { ...where, status: 'waiting' } }),
      prisma.conversation.count({ where: { ...where, status: 'abandoned' } }),
      prisma.conversation.count({ where: { ...where, status: 'active' } }),
      prisma.conversation.aggregate({
        where: { ...where, csat: { not: null } },
        _avg: { csat: true },
        _count: { csat: true },
      }),
    ])
    const avgWait = await prisma.conversation.aggregate({
      where,
      _avg: { waitTimeSeconds: true },
    })
    return NextResponse.json({
      total,
      waiting,
      abandoned,
      active: activeList,
      csatAvg: csatData._avg.csat,
      avgWaitSeconds: avgWait._avg.waitTimeSeconds,
    })
  }

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      channel: true,
      customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
    orderBy: { startedAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(conversations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Auto-number
  const count = await prisma.conversation.count()
  const conversationNo = buildConvNo(count + 1)

  // Apply routing rules
  const channel = await prisma.contactChannel.findUnique({ where: { id: body.channelId } })
  const routing = channel ? await applyRoutingRules(channel.type, body.customerId) : { queueId: null, agentName: null }

  const conversation = await prisma.conversation.create({
    data: {
      conversationNo,
      channelId: body.channelId,
      customerId: body.customerId ?? null,
      assignedAgentId: body.assignedAgentId ?? null,
      agentName: body.agentName ?? routing.agentName ?? null,
      queueId: body.queueId ?? routing.queueId ?? null,
      status: body.status ?? 'open',
      direction: body.direction ?? 'inbound',
      subject: body.subject ?? null,
      channel_ref: body.channel_ref ?? null,
      notes: body.notes ?? null,
    },
    include: {
      channel: true,
      customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
  })
  return NextResponse.json(conversation, { status: 201 })
}
