import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const platform = req.nextUrl.searchParams.get('platform')

  const shows = await prisma.liveShow.findMany({
    where: {
      ...(status && status !== 'all' ? { status } : {}),
      ...(platform && platform !== 'all' ? { platform } : {}),
    },
    include: {
      products: { orderBy: { position: 'asc' } },
      _count: { select: { events: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(shows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const show = await prisma.liveShow.create({
    data: {
      title: body.title,
      description: body.description,
      hostName: body.hostName,
      channelId: body.channelId,
      channelName: body.channelName,
      platform: body.platform ?? 'instagram',
      streamUrl: body.streamUrl,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    },
  })
  return NextResponse.json(show, { status: 201 })
}
