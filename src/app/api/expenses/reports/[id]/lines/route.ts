import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lines = await prisma.expenseLine.findMany({
    where: { reportId: id },
    include: { category: true },
  })
  return NextResponse.json(lines)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const line = await prisma.expenseLine.create({
    data: { ...body, reportId: id },
    include: { category: true },
  })

  // Recalculate report totals
  const allLines = await prisma.expenseLine.findMany({ where: { reportId: id } })
  const totalAmount = allLines.reduce((sum, l) => sum + l.amount, 0)
  const reimbursable = allLines.filter(l => !l.isPersonal).reduce((sum, l) => sum + l.amount, 0)

  await prisma.expenseReport.update({
    where: { id },
    data: { totalAmount, reimbursable },
  })

  return NextResponse.json(line, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { lineId } = await req.json()

  await prisma.expenseLine.delete({ where: { id: lineId } })

  // Recalculate report totals
  const allLines = await prisma.expenseLine.findMany({ where: { reportId: id } })
  const totalAmount = allLines.reduce((sum, l) => sum + l.amount, 0)
  const reimbursable = allLines.filter(l => !l.isPersonal).reduce((sum, l) => sum + l.amount, 0)

  await prisma.expenseReport.update({
    where: { id },
    data: { totalAmount, reimbursable },
  })

  return NextResponse.json({ ok: true })
}
