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

    const sheets = await prisma.expenseSheet.findMany({
      where: { ...(status ? { status } : {}) },
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(sheets)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { employeeId, employeeName, periodStart, periodEnd, currency, notes, lines = [] } = body

    const totalAmount = lines.reduce((s: number, l: { amount: number }) => s + (l.amount || 0), 0)

    const sheet = await prisma.expenseSheet.create({
      data: {
        sheetNo: genNo('EXP'),
        employeeId: employeeId ?? null,
        employeeName: employeeName ?? null,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        totalAmount,
        currency: currency ?? 'USD',
        notes: notes ?? null,
        lines: {
          create: lines.map((l: {
            expenseDate: string
            expenseType?: string
            description?: string
            amount?: number
            currency?: string
            projectNo?: string
            taskNo?: string
            receiptAttached?: boolean
          }) => ({
            expenseDate: new Date(l.expenseDate),
            expenseType: l.expenseType ?? 'Other',
            description: l.description ?? null,
            amount: l.amount ?? 0,
            currency: l.currency ?? 'USD',
            projectNo: l.projectNo ?? null,
            taskNo: l.taskNo ?? null,
            receiptAttached: l.receiptAttached ?? false,
          })),
        },
      },
      include: { lines: true },
    })
    return NextResponse.json(sheet, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
