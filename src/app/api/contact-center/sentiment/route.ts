import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const minScore = searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : undefined
    const maxScore = searchParams.get('maxScore') ? parseFloat(searchParams.get('maxScore')!) : undefined
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

    const where: Record<string, unknown> = {}
    if (minScore !== undefined || maxScore !== undefined) {
      where.sentimentScore = {
        ...(minScore !== undefined ? { gte: minScore } : {}),
        ...(maxScore !== undefined ? { lte: maxScore } : {}),
      }
    }
    if (from || to) {
      where.analyzedAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      }
    }
    if (searchParams.get('agentId')) where.agentId = searchParams.get('agentId')

    const records = await prisma.conversationSentiment.findMany({
      where,
      orderBy: { analyzedAt: 'desc' },
      take: 200,
    })
    return NextResponse.json(records)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const record = await prisma.conversationSentiment.create({
      data: {
        conversationId: body.conversationId ?? null,
        channel: body.channel ?? 'chat',
        sentiment: body.sentiment ?? 'neutral',
        sentimentScore: body.sentimentScore ?? 0,
        keywords: body.keywords ?? null,
        agentId: body.agentId ?? null,
        customerId: body.customerId ?? null,
      },
    })
    return NextResponse.json(record, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
