import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    scheduleId, employeeName, role, startTime, endTime,
    breakMinutes, notes, status,
  } = body

  if (!scheduleId || !employeeName || !startTime || !endTime) {
    return NextResponse.json(
      { error: 'scheduleId, employeeName, startTime, endTime are required' },
      { status: 400 }
    )
  }

  const shift = await prisma.scheduledShift.create({
    data: {
      scheduleId,
      employeeName,
      role: role ?? null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      breakMinutes: breakMinutes ?? 30,
      notes: notes ?? null,
      status: status ?? 'scheduled',
    },
  })

  return NextResponse.json(shift, { status: 201 })
}
