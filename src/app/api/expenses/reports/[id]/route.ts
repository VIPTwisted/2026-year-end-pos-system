import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await prisma.expenseReport.findUnique({
    where: { id },
    include: {
      category: true,
      lines: {
        include: {
          category: true,
        },
      },
    },
  })
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(report)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // Handle action transitions
  const { action, approvedBy, ...rest } = body as {
    action?: string
    approvedBy?: string
    [key: string]: unknown
  }

  let updateData: Record<string, unknown> = { ...rest }

  if (action === 'submit') {
    updateData = { status: 'submitted', submittedAt: new Date() }
  } else if (action === 'approve') {
    updateData = { status: 'approved', approvedAt: new Date(), approvedBy: approvedBy ?? 'System' }
  } else if (action === 'reject') {
    updateData = { status: 'rejected' }
  } else if (action === 'post') {
    // Post to GL: find expense account and debit it
    const report = await prisma.expenseReport.findUnique({ where: { id }, include: { lines: true } })
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const expenseAccount = await prisma.account.findFirst({
      where: { type: 'expense', isActive: true },
      orderBy: { code: 'asc' },
    })
    const payableAccount = await prisma.account.findFirst({
      where: { type: 'liability', isActive: true },
      orderBy: { code: 'asc' },
    })

    if (expenseAccount && payableAccount) {
      await prisma.journalEntry.create({
        data: {
          reference: report.reportNo,
          description: `Expense Report ${report.reportNo} - ${report.description}`,
          date: new Date(),
          lines: {
            create: [
              { accountId: expenseAccount.id, debit: report.reimbursable, credit: 0, memo: report.description },
              { accountId: payableAccount.id, debit: 0, credit: report.reimbursable, memo: `Payable - ${report.reportNo}` },
            ],
          },
        },
      })
    }
    updateData = { status: 'posted' }
  }

  const report = await prisma.expenseReport.update({ where: { id }, data: updateData })
  return NextResponse.json(report)
}
