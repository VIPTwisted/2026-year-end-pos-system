import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const status = sp.get('status')

    const periods = await prisma.payrollPeriod.findMany({
      where: status ? { status } : undefined,
      orderBy: { payDate: 'desc' },
      include: {
        _count: { select: { entries: true } },
        entries: {
          select: { grossPay: true, netPay: true },
        },
      },
    })

    return NextResponse.json(periods)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, startDate, endDate, payDate, notes } = body

    if (!name || !startDate || !endDate || !payDate) {
      return NextResponse.json({ error: 'name, startDate, endDate, and payDate are required' }, { status: 400 })
    }

    const period = await prisma.payrollPeriod.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        payDate: new Date(payDate),
        notes: notes ?? null,
        status: 'open',
      },
    })

    return NextResponse.json(period, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
