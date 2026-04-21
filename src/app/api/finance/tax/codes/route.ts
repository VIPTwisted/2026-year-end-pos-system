import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/finance/tax/codes
export async function GET() {
  const codes = await prisma.taxCode.findMany({
    include: { _count: { select: { transactions: true } } },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(codes)
}

// POST /api/finance/tax/codes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, rate, taxType, description, isActive = true, glAccountId } = body

    if (!code || !name || rate === undefined || !taxType) {
      return NextResponse.json(
        { error: 'code, name, rate, and taxType are required' },
        { status: 400 }
      )
    }

    const validTypes = ['sales', 'use', 'vat', 'exempt', 'withholding']
    if (!validTypes.includes(taxType)) {
      return NextResponse.json(
        { error: `taxType must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const rateNum = Number(rate)
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      return NextResponse.json(
        { error: 'rate must be between 0 and 100' },
        { status: 400 }
      )
    }

    const taxCode = await prisma.taxCode.create({
      data: {
        code,
        name,
        rate: rateNum,
        taxType,
        description: description || null,
        isActive: Boolean(isActive),
        glAccountId: glAccountId || null,
      },
    })

    return NextResponse.json(taxCode, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A tax code with that code already exists.' }, { status: 409 })
    }
    console.error('[POST /api/finance/tax/codes]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
