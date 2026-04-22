import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const events = await prisma.liveShowEvent.findMany({
    where: { showId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const event = await prisma.liveShowEvent.create({
    data: {
      showId: id,
      eventType: body.eventType,
      data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data ?? {}),
    },
  })
  return NextResponse.json(event, { status: 201 })
}
