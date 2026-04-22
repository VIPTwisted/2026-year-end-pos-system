import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const records = await prisma.freightReconciliation.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(records)
  } catch (err) {
    console.error('GET /api/transportation/freight', err)
    return NextResponse.json({ error: 'Failed to fetch freight records' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { carrier, serviceCode, billOfLadingNo, invoiceAmount, expectedAmount, notes } = body

    const inv = parseFloat(invoiceAmount) || 0
    const exp = parseFloat(expectedAmount) || 0

    const record = await prisma.freightReconciliation.create({
      data: {
        carrier,
        serviceCode: serviceCode ?? null,
        billOfLadingNo: billOfLadingNo ?? null,
        invoiceAmount: inv,
        expectedAmount: exp,
        difference: inv - exp,
        notes: notes ?? null,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    console.error('POST /api/transportation/freight', err)
    return NextResponse.json({ error: 'Failed to create freight record' }, { status: 500 })
  }
}
