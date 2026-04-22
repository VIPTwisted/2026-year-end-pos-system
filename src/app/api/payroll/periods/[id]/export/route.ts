import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: periodId } = await params

    const period = await prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        entries: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                department: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!period) {
      return NextResponse.json({ error: 'Period not found' }, { status: 404 })
    }

    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Position',
      'Department',
      'Pay Type',
      'Regular Hours',
      'Overtime Hours',
      'Hourly Rate',
      'Salary',
      'Commissions',
      'Bonuses',
      'Gross Pay',
      'Federal Tax',
      'State Tax',
      'Social Security',
      'Medicare',
      'Other Deductions',
      'Net Pay',
      'Status',
    ]

    const rows = period.entries.map((e) => [
      e.employee.id,
      e.employee.firstName,
      e.employee.lastName,
      e.employee.position,
      e.employee.department ?? '',
      e.payType ?? '',
      e.regularHours.toFixed(2),
      e.overtimeHours.toFixed(2),
      e.hourlyRate.toFixed(2),
      (e.salary ?? 0).toFixed(2),
      (e.commissions ?? 0).toFixed(2),
      (e.bonuses ?? 0).toFixed(2),
      e.grossPay.toFixed(2),
      e.federalTax.toFixed(2),
      e.stateTax.toFixed(2),
      e.socialSecurity.toFixed(2),
      e.medicare.toFixed(2),
      e.otherDeductions.toFixed(2),
      e.netPay.toFixed(2),
      e.status,
    ])

    const totalRow = [
      '',
      '',
      'TOTAL',
      '',
      '',
      '',
      period.entries.reduce((s, e) => s + e.regularHours, 0).toFixed(2),
      period.entries.reduce((s, e) => s + e.overtimeHours, 0).toFixed(2),
      '',
      '',
      period.entries.reduce((s, e) => s + (e.commissions ?? 0), 0).toFixed(2),
      period.entries.reduce((s, e) => s + (e.bonuses ?? 0), 0).toFixed(2),
      (period.totalGross ?? 0).toFixed(2),
      period.entries.reduce((s, e) => s + e.federalTax, 0).toFixed(2),
      period.entries.reduce((s, e) => s + e.stateTax, 0).toFixed(2),
      period.entries.reduce((s, e) => s + e.socialSecurity, 0).toFixed(2),
      period.entries.reduce((s, e) => s + e.medicare, 0).toFixed(2),
      period.entries.reduce((s, e) => s + e.otherDeductions, 0).toFixed(2),
      (period.totalNet ?? 0).toFixed(2),
      '',
    ]

    const csvContent = [headers, ...rows, totalRow]
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`
            }
            return str
          })
          .join(',')
      )
      .join('\n')

    const filename = `payroll-register-${period.name.replace(/\s+/g, '-').toLowerCase()}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
