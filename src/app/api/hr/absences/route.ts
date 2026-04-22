import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId') ?? undefined
    const cause      = searchParams.get('cause') ?? undefined
    const from       = searchParams.get('from') ?? undefined
    const to         = searchParams.get('to') ?? undefined

    const absences = await prisma.employeeAbsence.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(cause      ? { causeOfAbsence: cause } : {}),
        ...(from       ? { fromDate: { gte: new Date(from) } } : {}),
        ...(to         ? { toDate:   { lte: new Date(to)   } } : {}),
      },
      orderBy: { fromDate: 'desc' },
    })

    return NextResponse.json(absences)
  } catch (err) {
    console.error('[GET /api/hr/absences]', err)
    return NextResponse.json({ error: 'Failed to fetch absences', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      employeeId,
      employeeName,
      causeOfAbsence,
      fromDate,
      toDate,
      qty,
      unitOfMeasure,
      notes,
      returnDate,
    } = body as {
      employeeId: string
      employeeName?: string
      causeOfAbsence: string
      fromDate: string
      toDate: string
      qty?: number
      unitOfMeasure?: string
      notes?: string
      returnDate?: string
    }

    if (!employeeId || !causeOfAbsence || !fromDate || !toDate) {
      return NextResponse.json(
        { error: 'employeeId, causeOfAbsence, fromDate, and toDate are required' },
        { status: 400 }
      )
    }

    // Enrich with employee number if not provided
    let empNo: string | undefined
    try {
      const emp = await prisma.employee.findUnique({ where: { id: employeeId } })
      if (emp) {
        empNo = `EMP${String(emp.id.slice(-4)).toUpperCase()}`
      }
    } catch { /* best effort */ }

    const absence = await prisma.employeeAbsence.create({
      data: {
        employeeId,
        employeeNo:    empNo ?? null,
        employeeName:  employeeName ?? null,
        causeOfAbsence,
        fromDate:      new Date(fromDate),
        toDate:        new Date(toDate),
        qty:           qty ?? 1,
        unitOfMeasure: unitOfMeasure ?? 'Days',
        notes:         notes ?? null,
        returnDate:    returnDate ? new Date(returnDate) : null,
      },
    })

    return NextResponse.json(absence, { status: 201 })
  } catch (err) {
    console.error('[POST /api/hr/absences]', err)
    return NextResponse.json({ error: 'Failed to create absence', detail: String(err) }, { status: 500 })
  }
}
