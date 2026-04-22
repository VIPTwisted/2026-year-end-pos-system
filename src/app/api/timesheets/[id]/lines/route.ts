import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lines = await prisma.timeSheetLine.findMany({
    where: { sheetId: id },
    include: {
      resource: { select: { id: true, resourceNo: true, name: true } },
    },
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(lines)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { projectId, description, resourceId, type, date, hours, isBillable, notes } = body

    if (!date || !description?.trim()) {
      return NextResponse.json({ error: 'Date and description required' }, { status: 400 })
    }

    // Verify sheet is open
    const sheet = await prisma.timeSheet.findUnique({ where: { id } })
    if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 })
    if (sheet.status !== 'open') {
      return NextResponse.json({ error: 'Cannot add lines to a non-open sheet' }, { status: 400 })
    }

    const line = await prisma.timeSheetLine.create({
      data: {
        sheetId: id,
        projectId: projectId || null,
        description: description.trim(),
        resourceId: resourceId || null,
        type: type || 'resource',
        date: new Date(date),
        hours: parseFloat(hours) || 0,
      },
      include: {
        resource: { select: { id: true, resourceNo: true, name: true } },
      },
    })
    return NextResponse.json(line, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
