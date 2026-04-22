import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await prisma.financialReportDefinition.findUnique({ where: { id } })
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(report)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { action, ...rest } = body

  let updateData: Record<string, unknown> = {}

  if (action === 'publish') {
    updateData = { isPublished: true }
  } else if (action === 'unpublish') {
    updateData = { isPublished: false }
  } else if (action === 'run_preview') {
    updateData = { lastRunAt: new Date() }
  } else {
    if (rest.name !== undefined) updateData.name = rest.name
    if (rest.description !== undefined) updateData.description = rest.description
    if (rest.reportType !== undefined) updateData.reportType = rest.reportType
    if (rest.rowsJson !== undefined) updateData.rowsJson = rest.rowsJson
    if (rest.columnsJson !== undefined) updateData.columnsJson = rest.columnsJson
    if (rest.filtersJson !== undefined) updateData.filtersJson = rest.filtersJson
    if (rest.isPublished !== undefined) updateData.isPublished = rest.isPublished
  }

  const report = await prisma.financialReportDefinition.update({
    where: { id },
    data: updateData,
  })
  return NextResponse.json(report)
}
