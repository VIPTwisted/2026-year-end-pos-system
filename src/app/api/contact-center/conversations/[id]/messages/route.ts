import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const POSITIVE_WORDS = ['thanks', 'thank you', 'great', 'excellent', 'wonderful', 'amazing', 'good', 'happy', 'satisfied', 'perfect', 'resolved', 'helpful']
const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'horrible', 'unacceptable', 'angry', 'frustrated', 'problem', 'issue', 'broken', 'wrong', 'refund', 'cancel', 'worst', 'complaint']

function detectSentiment(text: string): { sentiment: string; score: number } {
  const lower = text.toLowerCase()
  const pos = POSITIVE_WORDS.filter(w => lower.includes(w)).length
  const neg = NEGATIVE_WORDS.filter(w => lower.includes(w)).length
  if (pos > neg) return { sentiment: 'positive', score: Math.min(1, pos * 0.2) }
  if (neg > pos) return { sentiment: 'negative', score: Math.max(-1, neg * -0.2) }
  return { sentiment: 'neutral', score: 0 }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const messages = await prisma.conversationMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(messages)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const { sentiment, score } = detectSentiment(body.content ?? '')

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId: id,
      sender: body.sender ?? 'agent',
      senderName: body.senderName ?? null,
      content: body.content,
      sentimentScore: score,
    },
  })

  // Update conversation sentiment if it's a customer message
  if (body.sender === 'customer') {
    await prisma.conversation.update({
      where: { id },
      data: { sentiment, sentimentScore: score },
    })
  }

  return NextResponse.json(message, { status: 201 })
}
