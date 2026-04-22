import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const garnishments = await prisma.garnishment.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true } } },
    })
    return NextResponse.json(garnishments)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.employeeId || !body.garnishType || !body.startDate) {
      return NextResponse.json({ error: 'employeeId, garnishType, and startDate are required' }, { status: 400 })
    }

    const garnishment = await prisma.garnishment.create({
      data: {
        employeeId: body.employeeId,
        garnishType: body.garnishType,
        caseNumber: body.caseNumber ?? null,
        agency: body.agency ?? null,
        issuingState: body.issuingState ?? null,
        amount: body.amount ?? 0,
        amountType: body.amountType ?? 'fixed',
        maxPercent: body.maxPercent ?? null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        notes: body.notes ?? null,
        status: 'active',
      },
    })
    return NextResponse.json(garnishment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
