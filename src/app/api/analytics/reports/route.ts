import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const reports = await prisma.savedReport.findMany({
    orderBy: [{ reportType: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(reports)
}

export async function POST(req: Request) {
  const body = await req.json()
  const report = await prisma.savedReport.create({
    data: {
      name: body.name,
      description: body.description,
      reportType: body.reportType,
      config: body.config ?? '{}',
      isShared: body.isShared ?? false,
      createdBy: body.createdBy,
      schedule: body.schedule,
    },
  })
  return NextResponse.json(report, { status: 201 })
}
