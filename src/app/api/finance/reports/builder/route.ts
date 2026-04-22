import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const published = searchParams.get('published')

  const where: Record<string, unknown> = {}
  if (type) where.reportType = type
  if (published !== null) where.isPublished = published === 'true'

  const reports = await prisma.financialReportDefinition.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(reports)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, reportType, description, rowsJson, columnsJson, filtersJson, isPublished } = body

  const report = await prisma.financialReportDefinition.create({
    data: {
      name,
      reportType: reportType ?? 'income_statement',
      description: description || null,
      rowsJson: rowsJson ?? null,
      columnsJson: columnsJson ?? null,
      filtersJson: filtersJson ?? null,
      isPublished: isPublished === true,
    },
  })
  return NextResponse.json(report, { status: 201 })
}
