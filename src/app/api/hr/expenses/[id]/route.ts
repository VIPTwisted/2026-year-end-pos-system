import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const report = await prisma.employeeExpenseReport.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
        lines: { orderBy: { expenseDate: 'asc' } },
      },
    })
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(report)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      action?: string
      approvedBy?: string
      rejectedReason?: string
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

    const report = await prisma.employeeExpenseReport.findUnique({ where: { id }, include: { lines: true } })
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { action, approvedBy, rejectedReason, notes, lines } = body

    // Handle status transitions
    if (action === 'submit') {
      if (report.status !== 'draft') {
        return NextResponse.json({ error: 'Only draft reports can be submitted' }, { status: 400 })
      }
      const updated = await prisma.employeeExpenseReport.update({
        where: { id },
        data: { status: 'submitted' },
        include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
      })
      return NextResponse.json(updated)
    }

    if (action === 'approve') {
      if (report.status !== 'submitted') {
        return NextResponse.json({ error: 'Only submitted reports can be approved' }, { status: 400 })
      }
      if (!approvedBy) {
        return NextResponse.json({ error: 'approvedBy is required' }, { status: 400 })
      }
      const updated = await prisma.employeeExpenseReport.update({
        where: { id },
        data: { status: 'approved', approvedBy, approvedAt: new Date() },
        include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
      })
      return NextResponse.json(updated)
    }

    if (action === 'reject') {
      if (report.status !== 'submitted') {
        return NextResponse.json({ error: 'Only submitted reports can be rejected' }, { status: 400 })
      }
      const updated = await prisma.employeeExpenseReport.update({
        where: { id },
        data: { status: 'rejected', rejectedReason: rejectedReason ?? null },
        include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
      })
      return NextResponse.json(updated)
    }

    if (action === 'pay') {
      if (report.status !== 'approved') {
        return NextResponse.json({ error: 'Only approved reports can be marked paid' }, { status: 400 })
      }
      const updated = await prisma.employeeExpenseReport.update({
        where: { id },
        data: { status: 'paid', paidAt: new Date() },
        include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
      })
      return NextResponse.json(updated)
    }

    // Add lines (and recalculate total)
    if (lines && lines.length > 0) {
      await prisma.employeeExpenseReportLine.createMany({
        data: lines.map(l => ({
          reportId: id,
          category: l.category,
          description: l.description,
          amount: Number(l.amount) || 0,
          expenseDate: new Date(l.expenseDate),
          receiptRef: l.receiptRef ?? null,
          notes: l.notes ?? null,
        })),
      })
      const allLines = await prisma.employeeExpenseReportLine.findMany({ where: { reportId: id } })
      const newTotal = allLines.reduce((sum, l) => sum + l.amount, 0)
      const updated = await prisma.employeeExpenseReport.update({
        where: { id },
        data: { totalAmount: newTotal, ...(notes !== undefined ? { notes } : {}) },
        include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
      })
      return NextResponse.json(updated)
    }

    // Generic notes update
    if (notes !== undefined) {
      const updated = await prisma.employeeExpenseReport.update({
        where: { id },
        data: { notes },
        include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'No valid action or data provided' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
