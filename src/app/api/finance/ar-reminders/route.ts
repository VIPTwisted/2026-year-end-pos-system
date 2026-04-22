import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateReminderNo() {
  return `REM-${Date.now().toString(36).toUpperCase()}`
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const status = sp.get('status')
    const levelParam = sp.get('level')

    const reminders = await prisma.aRReminder.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(levelParam ? { level: parseInt(levelParam, 10) } : {}),
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reminders })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      customerId: string
      level?: number
      notes?: string
      dueDate?: string
    }

    if (!body.customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
        { status: 400 }
      )
    }

    // Find customer's overdue invoices
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overdueInvoices = await prisma.customerInvoice.findMany({
      where: {
        customerId: body.customerId,
        status: { in: ['posted', 'partial'] },
        dueDate: { lt: today },
      },
      select: { totalAmount: true, paidAmount: true },
    })

    const totalOverdue = overdueInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
      0
    )

    const dueDate = body.dueDate ? new Date(body.dueDate) : new Date()

    const reminder = await prisma.aRReminder.create({
      data: {
        reminderNo: generateReminderNo(),
        customerId: body.customerId,
        level: body.level ?? 1,
        totalOverdue,
        dueDate,
        status: 'draft',
        notes: body.notes ?? null,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
