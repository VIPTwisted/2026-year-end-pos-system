import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      channel: true,
      customer: true,
      messages: { orderBy: { createdAt: 'asc' } },
      transfers: { orderBy: { transferredAt: 'asc' } },
    },
  })
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(conversation)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.status !== undefined) {
    data.status = body.status
    if (body.status === 'active' && !body.acceptedAt) data.acceptedAt = new Date()
    if (body.status === 'closed' || body.status === 'abandoned') data.closedAt = new Date()
  }
  if (body.agentName !== undefined) data.agentName = body.agentName
  if (body.assignedAgentId !== undefined) data.assignedAgentId = body.assignedAgentId
  if (body.sentiment !== undefined) data.sentiment = body.sentiment
  if (body.sentimentScore !== undefined) data.sentimentScore = body.sentimentScore
  if (body.csat !== undefined) data.csat = body.csat
  if (body.wrapUpCode !== undefined) data.wrapUpCode = body.wrapUpCode
  if (body.notes !== undefined) data.notes = body.notes
  if (body.waitTimeSeconds !== undefined) data.waitTimeSeconds = body.waitTimeSeconds
  if (body.handleTimeSeconds !== undefined) data.handleTimeSeconds = body.handleTimeSeconds
  if (body.linkedCaseId !== undefined) data.linkedCaseId = body.linkedCaseId
  if (body.acceptedAt !== undefined) data.acceptedAt = new Date(body.acceptedAt)
  if (body.closedAt !== undefined) data.closedAt = new Date(body.closedAt)
  if (body.queueId !== undefined) data.queueId = body.queueId
  if (body.subject !== undefined) data.subject = body.subject

  const conversation = await prisma.conversation.update({
    where: { id },
    data,
    include: {
      channel: true,
      customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      messages: { orderBy: { createdAt: 'asc' } },
      transfers: { orderBy: { transferredAt: 'asc' } },
    },
  })
  return NextResponse.json(conversation)
}
