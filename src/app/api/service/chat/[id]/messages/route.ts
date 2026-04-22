import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { senderType, senderName, body: msgBody } = body

  if (!msgBody) return NextResponse.json({ error: 'body is required' }, { status: 400 })

  const session = await prisma.chatSession.findUnique({ where: { id } })
  if (session?.status === 'waiting') {
    await prisma.chatSession.update({ where: { id }, data: { status: 'active' } })
  }

  const message = await prisma.chatMessage.create({
    data: {
      sessionId:  id,
      senderType: senderType ?? 'customer',
      senderName: senderName ?? null,
      body:       msgBody,
    },
  })
  return NextResponse.json(message, { status: 201 })
}
