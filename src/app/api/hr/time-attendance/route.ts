import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeName = searchParams.get('employeeName')
  const storeId = searchParams.get('storeId')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const status = searchParams.get('status')

  const records = await prisma.timeAttendance.findMany({
    where: {
      ...(employeeName ? { employeeName: { contains: employeeName } } : {}),
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
      ...(dateFrom || dateTo
        ? {
            clockIn: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    },
    orderBy: { clockIn: 'desc' },
  })
  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { employeeName, employeeId, storeId, storeName, notes } = body

  const record = await prisma.timeAttendance.create({
    data: {
      employeeName,
      employeeId,
      storeId,
      storeName,
      clockIn: new Date(),
      status: 'clocked-in',
      notes,
    },
  })
  return NextResponse.json(record, { status: 201 })
}
