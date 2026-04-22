import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const show = await prisma.liveShow.update({
    where: { id },
    data: { status: 'live', startedAt: new Date() },
  })
  await prisma.liveShowEvent.create({
    data: { showId: id, eventType: 'show-started', data: JSON.stringify({ startedAt: new Date() }) },
  })
  return NextResponse.json(show)
}
