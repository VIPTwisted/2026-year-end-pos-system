import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function genNo(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const runs = await prisma.payrollRun.findMany({
      where: { ...(status ? { status } : {}) },
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(runs)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      periodStart, periodEnd, payDate,
      paymentMethod, description,
      selectionMode, selectionFilter,
    } = body

    if (!periodStart || !periodEnd || !payDate) {
      return NextResponse.json({ error: 'periodStart, periodEnd, payDate required' }, { status: 400 })
    }

    const run = await prisma.payrollRun.create({
      data: {
        runNo: genNo('PR'),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        payDate: new Date(payDate),
        paymentMethod: paymentMethod ?? 'Direct Deposit',
        description: description ?? null,
        selectionMode: selectionMode ?? 'all_active',
        selectionFilter: selectionFilter ?? null,
      },
    })
    return NextResponse.json(run, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
