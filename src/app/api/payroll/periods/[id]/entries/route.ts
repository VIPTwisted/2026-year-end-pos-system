import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const entries = await prisma.payrollEntry.findMany({
      where: { periodId: id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
            hourlyRate: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(entries)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: periodId } = await params
    const body = await req.json()
    const {
      employeeId,
      payType = 'hourly',
      regularHours = 0,
      overtimeHours = 0,
      hourlyRate = 0,
      salary = 0,
      commissions = 0,
      bonuses = 0,
      otherDeductions = 0,
      notes,
    } = body

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 })
    }

    // Check period exists and is open
    const period = await prisma.payrollPeriod.findUnique({ where: { id: periodId } })
    if (!period) {
      return NextResponse.json({ error: 'Period not found' }, { status: 404 })
    }
    if (period.status === 'paid' || period.status === 'void') {
      return NextResponse.json({ error: 'Cannot add entries to a paid or voided period' }, { status: 400 })
    }

    // Upsert: if entry already exists for this employee+period, update it
    const existing = await prisma.payrollEntry.findFirst({
      where: { periodId, employeeId },
    })

    const reg = Number(regularHours)
    const ot = Number(overtimeHours)
    const rate = Number(hourlyRate)
    const sal = Number(salary)
    const comm = Number(commissions)
    const bon = Number(bonuses)
    const otherDed = Number(otherDeductions)

    // Calculate gross
    let gross = 0
    if (payType === 'hourly') {
      gross = reg * rate + ot * rate * 1.5 + comm + bon
    } else {
      gross = sal + comm + bon
    }

    // Tax calculations
    const federalTax = gross * 0.22
    const stateTax = gross * 0.05
    const socialSecurity = Math.min(gross * 0.062, 9932.4 / 12) // 2024 SS wage base approximation per entry
    const medicare = gross * 0.0145
    const totalDed = federalTax + stateTax + socialSecurity + medicare + otherDed
    const netPay = gross - totalDed

    const data = {
      periodId,
      employeeId,
      payType,
      regularHours: reg,
      overtimeHours: ot,
      hourlyRate: rate,
      salary: sal,
      commissions: comm,
      bonuses: bon,
      grossPay: gross,
      federalTax,
      stateTax,
      socialSecurity,
      medicare,
      otherDeductions: otherDed,
      netPay,
      notes: notes ?? null,
    }

    let entry
    if (existing) {
      entry = await prisma.payrollEntry.update({ where: { id: existing.id }, data })
    } else {
      entry = await prisma.payrollEntry.create({ data })
    }

    // Recalculate period totals
    const allEntries = await prisma.payrollEntry.findMany({ where: { periodId } })
    const totalGross = allEntries.reduce((s, e) => s + e.grossPay, 0)
    const totalNet = allEntries.reduce((s, e) => s + e.netPay, 0)
    const totalTax = allEntries.reduce(
      (s, e) => s + e.federalTax + e.stateTax + e.socialSecurity + e.medicare + e.otherDeductions,
      0
    )
    await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { totalGross, totalNet, totalTax },
    })

    return NextResponse.json(entry, { status: existing ? 200 : 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
