import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeName = searchParams.get('employeeName')
  const year = searchParams.get('year')

  const balances = await prisma.leaveBalance.findMany({
    where: {
      ...(employeeName ? { employeeName: { contains: employeeName } } : {}),
      ...(year ? { year: parseInt(year) } : {}),
    },
    orderBy: { employeeName: 'asc' },
  })
  return NextResponse.json(balances)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    employeeName, employeeId, year,
    vacationTotal, vacationUsed,
    sickTotal, sickUsed,
    personalTotal, personalUsed,
  } = body

  const balance = await prisma.leaveBalance.create({
    data: {
      employeeName,
      employeeId,
      year: year ?? 2026,
      vacationTotal: vacationTotal ?? 0,
      vacationUsed: vacationUsed ?? 0,
      sickTotal: sickTotal ?? 0,
      sickUsed: sickUsed ?? 0,
      personalTotal: personalTotal ?? 0,
      personalUsed: personalUsed ?? 0,
    },
  })
  return NextResponse.json(balance, { status: 201 })
}
