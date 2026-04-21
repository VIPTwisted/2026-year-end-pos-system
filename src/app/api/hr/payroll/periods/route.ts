import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const periods = await prisma.payrollPeriod.findMany({
      orderBy: { payDate: 'desc' },
      include: {
        _count: { select: { entries: true } },
        entries: {
          select: { grossPay: true, netPay: true },
        },
      },
    })

    const result = periods.map(p => ({
      ...p,
      totalGross: p.entries.reduce((s, e) => s + e.grossPay, 0),
      totalNet:   p.entries.reduce((s, e) => s + e.netPay,   0),
      entryCount: p._count.entries,
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch payroll periods' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, startDate, endDate, payDate, fiscalYear } = body

    if (!name || !startDate || !endDate || !payDate) {
      return NextResponse.json({ error: 'name, startDate, endDate, payDate are required' }, { status: 400 })
    }

    const period = await prisma.payrollPeriod.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        payDate:   new Date(payDate),
        fiscalYear: fiscalYear ?? null,
        status: 'open',
      },
    })

    return NextResponse.json(period, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create payroll period' }, { status: 500 })
  }
}
