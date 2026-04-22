import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const returns = await prisma.vatReturn.findMany({ orderBy: { startDate: 'desc' } })
    return NextResponse.json(returns)
  } catch (err) {
    console.error('[vat-returns GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const vatReturn = await prisma.vatReturn.create({ data: body })
    return NextResponse.json(vatReturn, { status: 201 })
  } catch (err) {
    console.error('[vat-returns POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
