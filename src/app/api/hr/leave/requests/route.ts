import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function generateRequestNo() {
  const year = new Date().getFullYear()
  const count = await prisma.leaveRequest.count({
    where: { requestNo: { startsWith: `LV-${year}-` } },
  })
  return `LV-${year}-${String(count + 1).padStart(4, '0')}`
}

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
    include: { leaveType: true, fmlaDetails: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const requestNo = await generateRequestNo()
  const request = await prisma.leaveRequest.create({
    data: {
      requestNo,
      employeeId: body.employeeId,
      leaveTypeId: body.leaveTypeId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      hours: body.hours,
      halfDay: body.halfDay ?? false,
      reason: body.reason ?? null,
      status: 'pending',
      isFmla: body.isFmla ?? false,
      fmlaDetails: body.isFmla && body.fmlaDetails
        ? {
            create: {
              employeeId: body.employeeId,
              fmlaReason: body.fmlaDetails.fmlaReason,
              certificationRequired: body.fmlaDetails.certificationRequired ?? true,
              certificationReceived: body.fmlaDetails.certificationReceived ?? false,
              certificationDueDate: body.fmlaDetails.certificationDueDate
                ? new Date(body.fmlaDetails.certificationDueDate)
                : null,
              intermittent: body.fmlaDetails.intermittent ?? false,
              reducedSchedule: body.fmlaDetails.reducedSchedule ?? false,
            },
          }
        : undefined,
    },
    include: { leaveType: true, fmlaDetails: true },
  })
  return NextResponse.json(request, { status: 201 })
}
