import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { closedBy } = body
    const existing = await prisma.fiscalPosSession.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.status === 'closed' || existing.status === 'audited') {
      return NextResponse.json({ error: 'Period already closed' }, { status: 400 })
    }
    await prisma.fiscalPosSession.update({ where: { id }, data: { status: 'closing' } })
    const totalSales = Math.round((Math.random() * 50000 + 5000) * 100) / 100
    const totalReturns = Math.round((Math.random() * 2000) * 100) / 100
    const totalTax = Math.round(totalSales * 0.0825 * 100) / 100
    const cashDrawer = Math.round((totalSales - totalReturns) * 0.3 * 100) / 100
    const actualCash = Math.round((cashDrawer + (Math.random() * 100 - 50)) * 100) / 100
    const variance = Math.round((actualCash - cashDrawer) * 100) / 100
    const period = await prisma.fiscalPosSession.update({
      where: { id },
      data: {
        status: 'closed',
        totalSales,
        totalReturns,
        totalTax,
        cashDrawer,
        variance,
        closedBy: closedBy ?? 'System',
        closedAt: new Date(),
        endDate: new Date(),
        zReportCount: (existing.zReportCount ?? 0) + 1,
      },
    })
    return NextResponse.json(period)
  } catch (error) {
    console.error('[POST /api/fiscal/periods/[id]/close]', error)
    return NextResponse.json({ error: 'Failed to close period' }, { status: 500 })
  }
}
