import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function isoWeekBounds(week: string): { start: Date; end: Date } | null {
  // week = "YYYY-WW"
  const match = week.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null
  const year = parseInt(match[1], 10)
  const isoWeek = parseInt(match[2], 10)

  // Jan 4 is always in week 1 of its year (ISO 8601)
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() === 0 ? 7 : jan4.getDay() // Mon=1 ... Sun=7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (isoWeek - 1) * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)
  return { start: monday, end: sunday }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const storeId = sp.get('storeId')
    const employeeId = sp.get('employeeId')
    const dateParam = sp.get('date')
    const weekParam = sp.get('week')

    const where: Prisma.ScheduledShiftWhereInput = {}
    if (storeId) where.storeId = storeId
    if (employeeId) where.employeeId = employeeId

    if (weekParam) {
      const bounds = isoWeekBounds(weekParam)
      if (bounds) {
        where.date = { gte: bounds.start, lt: bounds.end }
      }
    } else if (dateParam) {
      const day = new Date(dateParam)
      day.setHours(0, 0, 0, 0)
      const next = new Date(day)
      next.setDate(day.getDate() + 1)
      where.date = { gte: day, lt: next }
    }

    const shifts = await prisma.scheduledShift.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json(shifts)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      employeeId: string
      storeId: string
      date: string
      startTime: string
      endTime: string
      notes?: string
    }

    const { employeeId, storeId, date, startTime, endTime, notes } = body

    if (!employeeId || !storeId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'employeeId, storeId, date, startTime, and endTime are required' },
        { status: 400 },
      )
    }

    const shift = await prisma.scheduledShift.create({
      data: {
        employeeId,
        storeId,
        date: new Date(date),
        startTime,
        endTime,
        notes: notes ?? null,
        status: 'scheduled',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
