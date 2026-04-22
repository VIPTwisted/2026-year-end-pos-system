import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const eventType = req.nextUrl.searchParams.get('eventType')
  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')

  const events = await prisma.subscriptionChurnEvent.findMany({
    where: {
      ...(eventType ? { eventType } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(events)
}
