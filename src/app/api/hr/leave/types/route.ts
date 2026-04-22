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
      category: body.category ?? 'vacation',
      isPaid: body.isPaid ?? true,
      accrualEnabled: body.accrualEnabled ?? false,
      accrualRate: body.accrualRate ?? 0,
      maxBalance: body.maxBalance ?? null,
      requiresApproval: body.requiresApproval ?? true,
      advanceAllowed: body.advanceAllowed ?? false,
    },
  })
  return NextResponse.json(leaveType, { status: 201 })
}
