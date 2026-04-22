import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const employeeId = searchParams.get('employeeId')
  const isFmla = searchParams.get('isFmla')

  const requests = await prisma.leaveRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(employeeId ? { employeeId } : {}),
      ...(isFmla === 'true' ? { isFmla: true } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { employeeName, employeeId, leaveTypeName, leaveTypeId, startDate, endDate, days, hours, reason, isFmla } = body

  const request = await prisma.leaveRequest.create({
    data: {
      employeeName: employeeName ?? 'Unknown',
      employeeId: employeeId ?? null,
      leaveTypeName: leaveTypeName ?? 'Vacation',
      leaveTypeId: leaveTypeId ?? null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days: days ?? 1,
      hours: hours ?? 8,
      reason: reason ?? null,
      isFmla: isFmla ?? false,
    },
  })
  return NextResponse.json(request, { status: 201 })
}
