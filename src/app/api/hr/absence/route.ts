import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const causeOfAbsence = searchParams.get('cause')

    const absences = await prisma.employeeAbsence.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(causeOfAbsence ? { causeOfAbsence } : {}),
      },
      orderBy: { fromDate: 'desc' },
    })
    return NextResponse.json(absences)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      employeeId, employeeNo, employeeName,
      causeOfAbsence, fromDate, toDate,
      qty, unitOfMeasure, notes,
    } = body

    if (!fromDate || !toDate) {
      return NextResponse.json({ error: 'fromDate and toDate required' }, { status: 400 })
    }

    const absence = await prisma.employeeAbsence.create({
      data: {
        employeeId: employeeId ?? null,
        employeeNo: employeeNo ?? null,
        employeeName: employeeName ?? null,
        causeOfAbsence: causeOfAbsence ?? 'Sick Leave',
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        qty: qty ?? 0,
        unitOfMeasure: unitOfMeasure ?? 'Days',
        notes: notes ?? null,
      },
    })
    return NextResponse.json(absence, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
