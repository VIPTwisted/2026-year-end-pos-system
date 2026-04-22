import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')

  const schedules = await prisma.schedule.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
    },
    include: { shifts: true },
    orderBy: { weekStart: 'desc' },
  })
  return NextResponse.json(schedules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, storeId, storeName, weekStart, weekEnd } = body

  const weekStartDate = new Date(weekStart)
  const weekEndDate = weekEnd ? new Date(weekEnd) : new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)

  const schedule = await prisma.schedule.create({
    data: { name, storeId, storeName, weekStart: weekStartDate, weekEnd: weekEndDate },
  })
  return NextResponse.json(schedule, { status: 201 })
}
