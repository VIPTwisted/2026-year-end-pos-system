import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function generateCaseNo() {
  const year = new Date().getFullYear()
  const count = await prisma.injuryCase.count({
    where: { caseNo: { startsWith: `INJ-${year}-` } },
  })
  return `INJ-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const severity = searchParams.get('severity')
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (severity) where.severity = severity
  const cases = await prisma.injuryCase.findMany({
    where,
    orderBy: { incidentDate: 'desc' },
  })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const caseNo = await generateCaseNo()
  const injuryCase = await prisma.injuryCase.create({
    data: {
      caseNo,
      employeeId: body.employeeId,
      incidentDate: new Date(body.incidentDate),
      reportedDate: new Date(),
      location: body.location ?? null,
      description: body.description,
      injuryType: body.injuryType,
      bodyPart: body.bodyPart ?? null,
      severity: body.severity ?? 'minor',
      daysLost: body.daysLost ?? 0,
      recordable: body.recordable ?? false,
      oshaRecordable: body.oshaRecordable ?? false,
      status: 'open',
      treatment: body.treatment ?? null,
      witnesses: body.witnesses ?? null,
    },
  })
  return NextResponse.json(injuryCase, { status: 201 })
}
