import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const intents = await prisma.botIntent.findMany({
    where: { botId: id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(intents)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const intent = await prisma.botIntent.create({
    data: {
      botId: id,
      name: body.name,
      keywords: body.keywords,
      response: body.response,
      action: body.action ?? null,
      sortOrder: body.sortOrder ?? 0,
    },
  })
  return NextResponse.json(intent, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(req.url)
  const intentId = searchParams.get('intentId')
  if (!intentId) return NextResponse.json({ error: 'intentId required' }, { status: 400 })
  await prisma.botIntent.delete({ where: { id: intentId } })
  return NextResponse.json({ ok: true })
}
