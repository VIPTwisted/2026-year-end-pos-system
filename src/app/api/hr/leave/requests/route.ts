import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const status = searchParams.get('status')
  const leaveTypeId = searchParams.get('leaveTypeId')
  const isFmla = searchParams.get('isFmla')
  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (status) where.status = status
  if (leaveTypeId) where.leaveTypeId = leaveTypeId
  if (isFmla === 'true') where.isFmla = true
  const requests = await prisma.leaveRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Look up leave type name if leaveTypeId provided
  let leaveTypeName = 'Vacation'
  if (body.leaveTypeId) {
    const lt = await prisma.leaveType.findUnique({ where: { id: body.leaveTypeId } })
    if (lt) leaveTypeName = lt.name
  } else if (body.leaveType) {
    leaveTypeName = body.leaveType
  }

  // Calculate days from dates
  const start = new Date(body.startDate)
  const end = new Date(body.endDate)
  const diffMs = end.getTime() - start.getTime()
  const days = body.halfDay ? 0.5 : Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1)
  const hours = body.hours ?? days * 8

  const employeeName = body.employeeName ?? (() => {
    // Will be filled if we have employee lookup
    return body.employeeId ?? 'Unknown'
  })()

  const request = await prisma.leaveRequest.create({
    data: {
      employeeId: body.employeeId ?? null,
      employeeName,
      leaveTypeId: body.leaveTypeId ?? null,
      leaveTypeName,
      startDate: start,
      endDate: end,
      days,
      hours,
      halfDay: body.halfDay ?? false,
      reason: body.reason ?? null,
      status: 'pending',
      isFmla: body.isFmla ?? false,
      fmlaCase: body.fmlaDetails?.fmlaReason ?? null,
    },
  })
  return NextResponse.json(request, { status: 201 })
}
