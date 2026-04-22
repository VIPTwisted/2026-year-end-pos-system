import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  if (!employeeId) {
    return NextResponse.json({ error: 'employeeId required' }, { status: 400 })
  }
  const enrollments = await prisma.leavePlanEnrollment.findMany({
    where: { employeeId },
    include: { plan: { include: { leaveType: true } } },
    orderBy: { enrolledAt: 'asc' },
  })
  const balances = enrollments.map(e => ({
    ...e,
    available: Math.max(0, e.balance - e.pendingHours),
  }))
  return NextResponse.json(balances)
}
