import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.conversation.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [transfer] = await prisma.$transaction([
    prisma.conversationTransfer.create({
      data: {
        conversationId: id,
        fromAgentName: existing.agentName ?? null,
        toAgentName: body.toAgentName ?? null,
        toQueueName: body.toQueueName ?? null,
        reason: body.reason ?? null,
      },
    }),
    prisma.conversation.update({
      where: { id },
      data: {
        agentName: body.toAgentName ?? existing.agentName,
        assignedAgentId: body.toAgentId ?? existing.assignedAgentId,
        queueId: body.toQueueName ?? existing.queueId,
        status: 'waiting',
      },
    }),
    prisma.conversationMessage.create({
      data: {
        conversationId: id,
        sender: 'system',
        content: `Conversation transferred${body.toAgentName ? ` to ${body.toAgentName}` : body.toQueueName ? ` to queue: ${body.toQueueName}` : ''}${body.reason ? `. Reason: ${body.reason}` : ''}.`,
      },
    }),
  ])

  return NextResponse.json(transfer, { status: 201 })
}
