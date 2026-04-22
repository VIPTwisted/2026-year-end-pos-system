import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateReportNo(): string {
  const year = new Date().getFullYear()
  const seq = Date.now().toString().slice(-4).padStart(4, '0')
  return `EXP-${year}${seq}`
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const employeeId = sp.get('employeeId')
    const status = sp.get('status')

    const reports = await prisma.employeeExpenseReport.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reports)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      employeeId: string
      title: string
      notes?: string
      lines?: Array<{
        category: string
        description: string
        amount: number
        expenseDate: string
        receiptRef?: string
        notes?: string
      }>
    }

    const { employeeId, title, notes, lines = [] } = body

    if (!employeeId || !title) {
      return NextResponse.json({ error: 'employeeId and title are required' }, { status: 400 })
    }

    const totalAmount = lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
    const reportNo = generateReportNo()

    const report = await prisma.employeeExpenseReport.create({
      data: {
        reportNo,
        employeeId,
        title,
        notes,
        totalAmount,
        lines: {
          create: lines.map(l => ({
            category: l.category,
            description: l.description,
            amount: Number(l.amount) || 0,
            expenseDate: new Date(l.expenseDate),
            receiptRef: l.receiptRef ?? null,
            notes: l.notes ?? null,
          })),
        },
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        lines: true,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
