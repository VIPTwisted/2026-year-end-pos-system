import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/finance/cost-accounting/entries
export async function GET() {
  const entries = await prisma.costLedgerEntry.findMany({
    include: {
      costCenter: { select: { id: true, code: true, name: true } },
      costCategory: { select: { id: true, code: true, name: true } },
    },
    orderBy: { entryDate: 'desc' },
    take: 50,
  })
  return NextResponse.json(entries)
}

// POST /api/finance/cost-accounting/entries
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      costCenterId,
      costCategoryId,
      amount,
      description,
      sourceType = 'manual',
      sourceId,
      fiscalYear,
      periodNumber,
      entryDate,
    } = body

    if (!costCenterId || !costCategoryId || amount === undefined) {
      return NextResponse.json(
        { error: 'costCenterId, costCategoryId, and amount are required' },
        { status: 400 }
      )
    }

    const amountNum = Number(amount)
    if (isNaN(amountNum)) {
      return NextResponse.json({ error: 'amount must be a valid number' }, { status: 400 })
    }

    const validSourceTypes = ['manual', 'journal', 'payroll', 'fixed_asset', 'allocation']
    if (!validSourceTypes.includes(sourceType)) {
      return NextResponse.json(
        { error: `sourceType must be one of: ${validSourceTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const entry = await prisma.costLedgerEntry.create({
      data: {
        costCenterId,
        costCategoryId,
        amount: amountNum,
        description: description ?? null,
        sourceType,
        sourceId: sourceId ?? null,
        fiscalYear: fiscalYear ?? null,
        periodNumber: periodNumber != null ? Number(periodNumber) : null,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
      },
      include: {
        costCenter: { select: { id: true, code: true, name: true } },
        costCategory: { select: { id: true, code: true, name: true } },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/finance/cost-accounting/entries]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
