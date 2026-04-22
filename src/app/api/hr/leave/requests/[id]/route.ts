import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { leaveType: true, fmlaDetails: true },
  })
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(request)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.action === 'approve') {
    data.status = 'approved'
    data.approvedBy = body.approvedBy ?? 'Manager'
    data.approvedAt = new Date()
    // Deduct from leave balance if enrollment exists
    const req = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: true },
    })
    if (req) {
      const enrollment = await prisma.leavePlanEnrollment.findFirst({
        where: { employeeId: req.employeeId, plan: { leaveTypeId: req.leaveTypeId } },
      })
      if (enrollment) {
        await prisma.leavePlanEnrollment.update({
          where: { id: enrollment.id },
          data: {
            balance: Math.max(0, enrollment.balance - req.hours),
            usedYtd: enrollment.usedYtd + req.hours,
            pendingHours: Math.max(0, enrollment.pendingHours - req.hours),
          },
        })
      }
    }
  } else if (body.action === 'deny') {
    data.status = 'denied'
    data.denialReason = body.denialReason ?? null
    // Release pending hours
    const req = await prisma.leaveRequest.findUnique({ where: { id } })
    if (req) {
      const enrollment = await prisma.leavePlanEnrollment.findFirst({
        where: { employeeId: req.employeeId, plan: { leaveTypeId: req.leaveTypeId } },
      })
      if (enrollment) {
        await prisma.leavePlanEnrollment.update({
          where: { id: enrollment.id },
          data: { pendingHours: Math.max(0, enrollment.pendingHours - req.hours) },
        })
      }
    }
  } else if (body.action === 'cancel') {
    data.status = 'cancelled'
  } else {
    if (body.status) data.status = body.status
    if (body.reason !== undefined) data.reason = body.reason
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data,
    include: { leaveType: true, fmlaDetails: true },
  })
  return NextResponse.json(updated)
}
