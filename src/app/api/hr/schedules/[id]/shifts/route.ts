import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shifts = await prisma.scheduledShift.findMany({
    where: { scheduleId: id },
    orderBy: { startTime: 'asc' },
  })
  return NextResponse.json(shifts)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { employeeName, employeeId, role, startTime, endTime, breakMinutes, notes } = body

  const shift = await prisma.scheduledShift.create({
    data: {
      scheduleId: id,
      employeeName,
      employeeId,
      role,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      breakMinutes: breakMinutes ?? 30,
      notes,
    },
  })
  return NextResponse.json(shift, { status: 201 })
}
