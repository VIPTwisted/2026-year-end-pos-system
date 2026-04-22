import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const show = await prisma.liveShow.findUnique({
    where: { id },
    include: {
      products: { orderBy: { position: 'asc' } },
      events: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  })
  if (!show) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(show)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const show = await prisma.liveShow.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.hostName !== undefined ? { hostName: body.hostName } : {}),
      ...(body.channelName !== undefined ? { channelName: body.channelName } : {}),
      ...(body.platform !== undefined ? { platform: body.platform } : {}),
      ...(body.streamUrl !== undefined ? { streamUrl: body.streamUrl } : {}),
      ...(body.scheduledAt !== undefined ? { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.peakViewers !== undefined ? { peakViewers: body.peakViewers } : {}),
      ...(body.totalViewers !== undefined ? { totalViewers: body.totalViewers } : {}),
    },
  })
  return NextResponse.json(show)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.liveShow.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
