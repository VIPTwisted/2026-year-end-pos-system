import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const resourceId = searchParams.get('resourceId')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (resourceId) where.resourceId = resourceId

  const sheets = await prisma.timeSheet.findMany({
    where,
    include: {
      project: { select: { id: true, projectNo: true, description: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sheets)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resourceId, employeeId, startDate, endDate, projectId } = body

    if (!resourceId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Resource, start date, and end date are required' }, { status: 400 })
    }

    // Auto-number: TS-YYYY-NNNN
    const year = new Date().getFullYear()
    const prefix = `TS-${year}-`
    const last = await prisma.timeSheet.findFirst({
      where: { sheetNo: { startsWith: prefix } },
      orderBy: { sheetNo: 'desc' },
    })
    const seq = last ? parseInt((last.sheetNo ?? '').slice(prefix.length)) + 1 : 1
    const sheetNo = `${prefix}${String(seq).padStart(4, '0')}`

    const sheet = await prisma.timeSheet.create({
      data: {
        sheetNo,
        resourceId: resourceId || null,
        employeeId: employeeId || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        projectId: projectId || null,
      },
      include: {
        project: { select: { id: true, projectNo: true, description: true } },
      },
    })
    return NextResponse.json(sheet, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
