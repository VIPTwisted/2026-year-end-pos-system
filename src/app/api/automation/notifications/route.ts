import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const isRead = req.nextUrl.searchParams.get('isRead')
  const priority = req.nextUrl.searchParams.get('priority')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '100')

  const notifications = await prisma.notification.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(isRead !== null ? { isRead: isRead === 'true' } : {}),
      ...(priority ? { priority } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return NextResponse.json(notifications)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.title || !body.body) return NextResponse.json({ error: 'title and body required' }, { status: 400 })
  const notification = await prisma.notification.create({
    data: {
      userId: body.userId ?? null,
      userName: body.userName ?? null,
      title: body.title,
      body: body.body,
      channel: body.channel ?? 'in-app',
      priority: body.priority ?? 'normal',
      actionUrl: body.actionUrl ?? null,
      sourceType: body.sourceType ?? null,
      sourceId: body.sourceId ?? null,
    },
  })
  return NextResponse.json(notification, { status: 201 })
}
