import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currencies = await prisma.currency.findMany({
      include: {
        exchangeRates: {
          orderBy: { rateDate: 'desc' },
          take: 5,
        },
      },
      orderBy: [{ isBase: 'desc' }, { code: 'asc' }],
    })
    return NextResponse.json(currencies)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, symbol, isBase, isActive } = body

    if (!code || !name || !symbol) {
      return NextResponse.json({ error: 'code, name, and symbol are required' }, { status: 400 })
    }

    // If setting as base, unset existing base currency
    if (isBase) {
      await prisma.currency.updateMany({ where: { isBase: true }, data: { isBase: false } })
    }

    const currency = await prisma.currency.create({
      data: {
        code: code.toUpperCase(),
        name,
        symbol,
        isBase: isBase ?? false,
        isActive: isActive ?? true,
      },
    })
    return NextResponse.json(currency, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
  }
}
