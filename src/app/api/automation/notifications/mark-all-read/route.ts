import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const userId = body.userId
  const result = await prisma.notification.updateMany({
    where: { isRead: false, ...(userId ? { userId } : {}) },
    data: { isRead: true, readAt: new Date() },
  })
  return NextResponse.json({ updated: result.count })
}
