import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateChatNumber() {
  return `CHT-${Date.now().toString(36).toUpperCase()}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const sessions = await prisma.chatSession.findMany({
    where: status ? { status } : undefined,
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerName, customerEmail, agentName, queueId } = body

  const session = await prisma.chatSession.create({
    data: {
      sessionNumber: generateChatNumber(),
      customerName:  customerName  ?? null,
      customerEmail: customerEmail ?? null,
      agentName:     agentName     ?? null,
      queueId:       queueId       ?? null,
      status:        'waiting',
    },
    include: { messages: true },
  })
  return NextResponse.json(session, { status: 201 })
}
