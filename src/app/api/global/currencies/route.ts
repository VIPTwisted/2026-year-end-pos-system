import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const currencies = await prisma.currency.findMany({
    include: {
      exchangeRates: {
        where: { isActive: true },
        orderBy: { effectiveDate: 'desc' },
        take: 5,
      },
    },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(currencies)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, name, symbol, decimalPlaces, isBase, isActive } = body
  if (!code || !name || !symbol) {
    return NextResponse.json({ error: 'code, name, symbol required' }, { status: 400 })
  }
  if (isBase) {
    await prisma.currency.updateMany({ where: { isBase: true }, data: { isBase: false } })
  }
  const currency = await prisma.currency.create({
    data: {
      code: code.toUpperCase(),
      name,
      symbol,
      decimalPlaces: decimalPlaces ?? 2,
      isBase: isBase ?? false,
      isActive: isActive ?? true,
    },
  })
  return NextResponse.json(currency, { status: 201 })
}
