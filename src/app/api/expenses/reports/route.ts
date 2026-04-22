import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genReportNo() {
  const year = new Date().getFullYear()
  const seq = Date.now().toString(36).toUpperCase().slice(-4)
  return `EXP-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const employeeId = searchParams.get('employeeId')

  const reports = await prisma.expenseReport.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(employeeId ? { employeeId } : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reports)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const report = await prisma.expenseReport.create({
    data: {
      ...body,
      reportNo: genReportNo(),
    },
  })
  return NextResponse.json(report, { status: 201 })
}
