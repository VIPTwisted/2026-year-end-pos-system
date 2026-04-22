import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { action, approvedBy, notes } = body

  if (action === 'clock-out') {
    const existing = await prisma.timeAttendance.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const clockOut = new Date()
    const clockIn = new Date(existing.clockIn)
    const diffMs = clockOut.getTime() - clockIn.getTime()
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))
    const regularHours = 8
    const overtimeHrs = totalHours > regularHours ? parseFloat((totalHours - regularHours).toFixed(2)) : 0

    const record = await prisma.timeAttendance.update({
      where: { id },
      data: { clockOut, totalHours, overtimeHrs, status: 'clocked-out', notes },
    })
    return NextResponse.json(record)
  }

  if (action === 'break-start') {
    const record = await prisma.timeAttendance.update({
      where: { id },
      data: { breakStart: new Date(), status: 'on-break' },
    })
    return NextResponse.json(record)
  }

  if (action === 'break-end') {
    const record = await prisma.timeAttendance.update({
      where: { id },
      data: { breakEnd: new Date(), status: 'clocked-in' },
    })
    return NextResponse.json(record)
  }

  if (action === 'approve') {
    const record = await prisma.timeAttendance.update({
      where: { id },
      data: { approvedBy },
    })
    return NextResponse.json(record)
  }

  // Generic patch
  const record = await prisma.timeAttendance.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(record)
}
