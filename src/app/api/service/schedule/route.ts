import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const storeId = searchParams.get('storeId')

  const schedules = await prisma.schedule.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(storeId ? { storeId } : {}),
    },
    include: {
      _count: { select: { shifts: true } },
      shifts: {
        orderBy: { startTime: 'asc' },
      },
    },
    orderBy: { weekStart: 'desc' },
  })

  return NextResponse.json(schedules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, storeName, weekStart, weekEnd, status } = body

  if (!name || !weekStart || !weekEnd) {
    return NextResponse.json({ error: 'name, weekStart, weekEnd are required' }, { status: 400 })
  }

  const schedule = await prisma.schedule.create({
    data: {
      name,
      storeName: storeName ?? null,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      status: status ?? 'draft',
    },
    include: {
      _count: { select: { shifts: true } },
      shifts: true,
    },
  })

  return NextResponse.json(schedule, { status: 201 })
}
