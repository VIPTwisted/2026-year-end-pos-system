import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const run = await prisma.payrollRun.findUnique({
      where: { id: params.id },
      include: { lines: { orderBy: { employeeName: 'asc' } } },
    })
    if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(run)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { status, lines, employeeCount, totalGross, totalTax, totalNI, totalNet, totalEmployerCosts } = body

    const updates: Record<string, unknown> = {}
    if (status) {
      updates.status = status
      if (status === 'approved') updates.approvedAt = new Date()
      if (status === 'posted')   updates.postedAt   = new Date()
    }
    if (employeeCount !== undefined) updates.employeeCount = employeeCount
    if (totalGross !== undefined)    updates.totalGross    = totalGross
    if (totalTax !== undefined)      updates.totalTax      = totalTax
    if (totalNI !== undefined)       updates.totalNI       = totalNI
    if (totalNet !== undefined)      updates.totalNet      = totalNet
    if (totalEmployerCosts !== undefined) updates.totalEmployerCosts = totalEmployerCosts

    const run = await prisma.payrollRun.update({
      where: { id: params.id },
      data: updates,
    })

    // Replace lines if provided
    if (lines && Array.isArray(lines)) {
      await prisma.payrollRunLine.deleteMany({ where: { payrollRunId: params.id } })
      await prisma.payrollRunLine.createMany({
        data: lines.map((l: {
          employeeId?: string
          employeeNo?: string
          employeeName?: string
          department?: string
          grossPay?: number
          incomeTax?: number
          ni?: number
          netPay?: number
          employerNI?: number
          bankAccount?: string
          notes?: string
        }) => ({
          payrollRunId: params.id,
          employeeId: l.employeeId ?? null,
          employeeNo: l.employeeNo ?? null,
          employeeName: l.employeeName ?? null,
          department: l.department ?? null,
          grossPay: l.grossPay ?? 0,
          incomeTax: l.incomeTax ?? 0,
          ni: l.ni ?? 0,
          netPay: l.netPay ?? 0,
          employerNI: l.employerNI ?? 0,
          bankAccount: l.bankAccount ?? null,
          notes: l.notes ?? null,
        })),
      })
    }

    const updated = await prisma.payrollRun.findUnique({
      where: { id: params.id },
      include: { lines: true },
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
