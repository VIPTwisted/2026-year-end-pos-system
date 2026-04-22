import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const schedule = await prisma.financialReportDefinition.findUnique({ where: { id } })
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...schedule,
    rows:    schedule.rowsJson    ? JSON.parse(schedule.rowsJson)    : [],
    columns: schedule.columnsJson ? JSON.parse(schedule.columnsJson) : [],
    filters: schedule.filtersJson ? JSON.parse(schedule.filtersJson) : {},
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.name        !== undefined) data.name        = body.name
  if (body.reportType  !== undefined) data.reportType  = body.reportType
  if (body.description !== undefined) data.description = body.description
  if (body.isPublished !== undefined) data.isPublished = body.isPublished
  if (body.rowsJson    !== undefined) data.rowsJson    = typeof body.rowsJson === 'string' ? body.rowsJson : JSON.stringify(body.rowsJson)
  if (body.columnsJson !== undefined) data.columnsJson = typeof body.columnsJson === 'string' ? body.columnsJson : JSON.stringify(body.columnsJson)
  if (body.filtersJson !== undefined) data.filtersJson = typeof body.filtersJson === 'string' ? body.filtersJson : JSON.stringify(body.filtersJson)

  const updated = await prisma.financialReportDefinition.update({ where: { id }, data })
  return NextResponse.json(updated)
}
