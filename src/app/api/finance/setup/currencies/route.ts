import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currencies = await prisma.financeCurrency.findMany({ orderBy: { code: 'asc' } })
    return NextResponse.json(currencies)
  } catch (err) {
    console.error('[currencies GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const currency = await prisma.financeCurrency.create({
      data: { ...body, lastDateModified: new Date() },
    })
    return NextResponse.json(currency, { status: 201 })
  } catch (err) {
    console.error('[currencies POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
