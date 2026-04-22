import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const storeId = sp.get('storeId')
    const employeeId = sp.get('employeeId')

    const schedules = await prisma.workSchedule.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
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
      orderBy: [
        { employee: { lastName: 'asc' } },
        { dayOfWeek: 'asc' },
      ],
    })

    return NextResponse.json(schedules)
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
      dayOfWeek: number
      startTime: string
      endTime: string
      effectiveFrom?: string
      effectiveTo?: string
      notes?: string
    }

    const { employeeId, storeId, dayOfWeek, startTime, endTime, effectiveFrom, effectiveTo, notes } = body

    if (!employeeId || !storeId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'employeeId, storeId, dayOfWeek, startTime, and endTime are required' },
        { status: 400 },
      )
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ error: 'dayOfWeek must be 0–6' }, { status: 400 })
    }

    const schedule = await prisma.workSchedule.create({
      data: {
        employeeId,
        storeId,
        dayOfWeek,
        startTime,
        endTime,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        notes: notes ?? null,
        isActive: true,
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

    return NextResponse.json(schedule, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
