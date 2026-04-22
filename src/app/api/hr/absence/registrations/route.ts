import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')

  const registrations = await prisma.absenceRegistration.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
    },
    include: {
      code: true,
    },
    orderBy: { fromDate: 'desc' },
  })
  return NextResponse.json(registrations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const reg = await prisma.absenceRegistration.create({
    data: body,
    include: { code: true },
  })
  return NextResponse.json(reg, { status: 201 })
}
