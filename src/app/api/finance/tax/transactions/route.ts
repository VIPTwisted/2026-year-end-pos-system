import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/finance/tax/transactions
export async function GET() {
  const transactions = await prisma.taxTransaction.findMany({
    include: {
      taxCode: { select: { code: true, name: true, rate: true } },
    },
    orderBy: { taxDate: 'desc' },
    take: 50,
  })
  return NextResponse.json(transactions)
}

// POST /api/finance/tax/transactions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { taxCodeId, sourceType, sourceId, taxableAmount, taxDate, fiscalYear, periodNumber } = body

    if (!taxCodeId || !sourceType || !sourceId || taxableAmount === undefined) {
      return NextResponse.json(
        { error: 'taxCodeId, sourceType, sourceId, and taxableAmount are required' },
        { status: 400 }
      )
    }

    const validSources = ['order', 'vendor_invoice', 'customer_invoice', 'manual']
    if (!validSources.includes(sourceType)) {
      return NextResponse.json(
        { error: `sourceType must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    const taxCode = await prisma.taxCode.findUnique({ where: { id: taxCodeId } })
    if (!taxCode) {
      return NextResponse.json({ error: 'Tax code not found' }, { status: 404 })
    }

    const taxableAmt = Number(taxableAmount)
    const taxAmount = (taxableAmt * Number(taxCode.rate)) / 100

    const transaction = await prisma.taxTransaction.create({
      data: {
        taxCodeId,
        sourceType,
        sourceId,
        taxableAmount: taxableAmt,
        taxAmount,
        taxDate: taxDate ? new Date(taxDate) : new Date(),
        fiscalYear: fiscalYear ?? null,
        periodNumber: periodNumber ?? null,
      },
      include: {
        taxCode: { select: { code: true, name: true, rate: true } },
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/finance/tax/transactions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
