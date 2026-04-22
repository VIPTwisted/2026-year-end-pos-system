import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const types = await prisma.leaveType.findMany({ orderBy: { code: 'asc' } })
  return NextResponse.json(types)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const leaveType = await prisma.leaveType.create({
    data: {
      code: body.code,
      name: body.name,
      accrualRate: body.accrualRate ?? 0,
      maxBalance: body.maxBalance ?? null,
      requiresApproval: body.requiresApproval ?? true,
      isFmlaEligible: body.isFmlaEligible ?? false,
      isPaid: body.isPaid ?? true,
      color: body.color ?? '#3b82f6',
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(leaveType, { status: 201 })
}
