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
    const diffMs = clockOut.getTime() - new Date(existing.clockIn).getTime()
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))
    const overtimeHrs = totalHours > 8 ? parseFloat((totalHours - 8).toFixed(2)) : 0
    const record = await prisma.timeAttendance.update({
      where: { id },
      data: { clockOut, totalHours, overtimeHrs, status: 'clocked-out', notes },
    })
    return NextResponse.json(record)
  }
  if (action === 'break-start') {
    return NextResponse.json(await prisma.timeAttendance.update({ where: { id }, data: { breakStart: new Date(), status: 'on-break' } }))
  }
  if (action === 'break-end') {
    return NextResponse.json(await prisma.timeAttendance.update({ where: { id }, data: { breakEnd: new Date(), status: 'clocked-in' } }))
  }
  if (action === 'approve') {
    return NextResponse.json(await prisma.timeAttendance.update({ where: { id }, data: { approvedBy } }))
  }
  const record = await prisma.timeAttendance.update({ where: { id }, data: body })
  return NextResponse.json(record)
}
