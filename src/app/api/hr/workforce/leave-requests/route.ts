import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const leaveType = searchParams.get('leaveType')
  const employeeName = searchParams.get('employeeName')

  const requests = await prisma.leaveRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(leaveType ? { leaveType } : {}),
      ...(employeeName ? { employeeName: { contains: employeeName } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { employeeName, employeeId, leaveType, startDate, endDate, days, reason } = body

  const request = await prisma.leaveRequest.create({
    data: {
      employeeName,
      employeeId,
      leaveType: leaveType ?? 'vacation',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days: days ?? 1,
      reason,
    },
  })
  return NextResponse.json(request, { status: 201 })
}
