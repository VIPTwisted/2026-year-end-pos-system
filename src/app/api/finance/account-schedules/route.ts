import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reportType = searchParams.get('type')

  const where: Record<string, unknown> = {}
  if (reportType) where.reportType = reportType

  const schedules = await prisma.financialReportDefinition.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(schedules)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const schedule = await prisma.financialReportDefinition.create({
    data: {
      name:        body.name ?? 'New Account Schedule',
      reportType:  body.reportType ?? 'custom',
      description: body.description ?? null,
      rowsJson:    body.rowsJson ? JSON.stringify(body.rowsJson) : null,
      columnsJson: body.columnsJson ? JSON.stringify(body.columnsJson) : null,
      filtersJson: body.filtersJson ? JSON.stringify(body.filtersJson) : null,
      isPublished: false,
    },
  })

  return NextResponse.json(schedule, { status: 201 })
}
