import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Context {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const regularHoursOverride: number = body.regularHours ?? 80

    // Verify period exists
    const period = await prisma.payrollPeriod.findUnique({ where: { id } })
    if (!period) {
      return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 })
    }

    if (period.status !== 'open') {
      return NextResponse.json({ error: 'Can only generate entries for open periods' }, { status: 400 })
    }

    const employees = await prisma.employee.findMany({ where: { isActive: true } })

    let generated = 0

    for (const employee of employees) {
      const hourlyRate    = employee.hourlyRate ?? 15
      const regularHours  = regularHoursOverride
      const overtimeHours = 0
      const grossPay      = regularHours * hourlyRate + overtimeHours * hourlyRate * 1.5
      const federalTax    = grossPay * 0.22
      const stateTax      = grossPay * 0.05
      const socialSecurity = grossPay * 0.062
      const medicare      = grossPay * 0.0145
      const otherDeductions = 0
      const netPay        = grossPay - federalTax - stateTax - socialSecurity - medicare - otherDeductions

      // Check if entry already exists for this employee + period
      const existing = await prisma.payrollEntry.findFirst({
        where: { periodId: id, employeeId: employee.id },
      })

      if (!existing) {
        await prisma.payrollEntry.create({
          data: {
            periodId: id,
            employeeId: employee.id,
            regularHours,
            overtimeHours,
            hourlyRate,
            grossPay,
            federalTax,
            stateTax,
            socialSecurity,
            medicare,
            otherDeductions,
            netPay,
            status: 'draft',
          },
        })
        generated++
      }
    }

    return NextResponse.json({ generated, total: employees.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate entries' }, { status: 500 })
  }
}
