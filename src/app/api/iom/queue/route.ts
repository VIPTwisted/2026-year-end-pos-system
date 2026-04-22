import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const queue = await prisma.orderQueue.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(queue)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const messageId = body.messageId ?? `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const item = await prisma.orderQueue.create({
    data: {
      messageId,
      sourceType: body.sourceType,
      payload: body.payload,
      status: 'pending',
      maxRetries: body.maxRetries ?? 3,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
