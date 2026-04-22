import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id: periodId } = await params

    const period = await prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { entries: true },
    })

    if (!period) {
      return NextResponse.json({ error: 'Period not found' }, { status: 404 })
    }
    if (period.status === 'void') {
      return NextResponse.json({ error: 'Cannot calculate a voided period' }, { status: 400 })
    }

    // Recalculate every entry
    const updates = period.entries.map(async (entry) => {
      const reg = entry.regularHours
      const ot = entry.overtimeHours
      const rate = entry.hourlyRate
      const sal = entry.salary ?? 0
      const comm = entry.commissions ?? 0
      const bon = entry.bonuses ?? 0
      const otherDed = entry.otherDeductions

      let gross = 0
      if (entry.payType === 'hourly') {
        gross = reg * rate + ot * rate * 1.5 + comm + bon
      } else {
        gross = sal + comm + bon
      }

      const federalTax = gross * 0.22
      const stateTax = gross * 0.05
      const socialSecurity = gross * 0.062
      const medicare = gross * 0.0145
      const netPay = gross - (federalTax + stateTax + socialSecurity + medicare + otherDed)

      return prisma.payrollEntry.update({
        where: { id: entry.id },
        data: { grossPay: gross, federalTax, stateTax, socialSecurity, medicare, netPay },
      })
    })

    const updatedEntries = await Promise.all(updates)

    const totalGross = updatedEntries.reduce((s, e) => s + e.grossPay, 0)
    const totalNet = updatedEntries.reduce((s, e) => s + e.netPay, 0)
    const totalTax = updatedEntries.reduce(
      (s, e) => s + e.federalTax + e.stateTax + e.socialSecurity + e.medicare + e.otherDeductions,
      0
    )

    const updatedPeriod = await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        totalGross,
        totalNet,
        totalTax,
        status: period.status === 'open' ? 'processing' : period.status,
      },
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
        },
      },
    })

    return NextResponse.json({
      period: updatedPeriod,
      entriesCalculated: updatedEntries.length,
      totalGross,
      totalNet,
      totalTax,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
