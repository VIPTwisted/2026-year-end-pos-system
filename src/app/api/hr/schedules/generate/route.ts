import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isoWeekBounds(week: string): { start: Date; end: Date } | null {
  const match = week.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null
  const year = parseInt(match[1], 10)
  const isoWeek = parseInt(match[2], 10)
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() === 0 ? 7 : jan4.getDay()
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (isoWeek - 1) * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)
  return { start: monday, end: sunday }
}

// dayOfWeek offset from Monday (0=Mon ... 6=Sun) mapped from ISO weekday
// Prisma dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
function dayOffsetFromMonday(dayOfWeek: number): number {
  // 0=Sun → 6, 1=Mon → 0, 2=Tue → 1, ... 6=Sat → 5
  if (dayOfWeek === 0) return 6
  return dayOfWeek - 1
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { week: string; storeId?: string }
    const { week, storeId } = body

    if (!week) {
      return NextResponse.json({ error: 'week (YYYY-WW) is required' }, { status: 400 })
    }

    const bounds = isoWeekBounds(week)
    if (!bounds) {
      return NextResponse.json({ error: 'Invalid week format — use YYYY-WW' }, { status: 400 })
    }

    // Fetch active work schedule templates
    const templates = await prisma.workSchedule.findMany({
      where: {
        isActive: true,
        ...(storeId ? { storeId } : {}),
        effectiveFrom: { lte: bounds.end },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: bounds.start } },
        ],
      },
    })

    if (templates.length === 0) {
      return NextResponse.json({ created: 0, message: 'No active templates found for this week' })
    }

    // For each template, compute the specific date in that week
    const shiftsToCreate: {
      employeeId: string
      storeId: string
      date: Date
      startTime: string
      endTime: string
      status: string
    }[] = []

    for (const tpl of templates) {
      const offset = dayOffsetFromMonday(tpl.dayOfWeek)
      const shiftDate = new Date(bounds.start)
      shiftDate.setDate(bounds.start.getDate() + offset)

      // Check if a shift already exists for this employee on this date
      const existing = await prisma.scheduledShift.findFirst({
        where: {
          employeeId: tpl.employeeId,
          storeId: tpl.storeId,
          date: {
            gte: new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate()),
            lt: new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate() + 1),
          },
        },
      })

      if (!existing) {
        shiftsToCreate.push({
          employeeId: tpl.employeeId,
          storeId: tpl.storeId,
          date: shiftDate,
          startTime: tpl.startTime,
          endTime: tpl.endTime,
          status: 'scheduled',
        })
      }
    }

    const result = await prisma.scheduledShift.createMany({
      data: shiftsToCreate,
    })

    return NextResponse.json({ created: result.count, skipped: templates.length - result.count })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
