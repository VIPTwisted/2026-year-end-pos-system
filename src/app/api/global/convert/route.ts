import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { amount, fromCode, toCode } = body
  if (amount === undefined || !fromCode || !toCode) {
    return NextResponse.json({ error: 'amount, fromCode, toCode required' }, { status: 400 })
  }
  if (fromCode.toUpperCase() === toCode.toUpperCase()) {
    return NextResponse.json({
      amount,
      from: fromCode.toUpperCase(),
      to: toCode.toUpperCase(),
      rate: 1,
      converted: amount,
      formattedConverted: `${toCode.toUpperCase()} ${Number(amount).toFixed(2)}`,
    })
  }

  const fromCurrency = await prisma.currency.findUnique({ where: { code: fromCode.toUpperCase() } })
  if (!fromCurrency) return NextResponse.json({ error: `Currency ${fromCode} not found` }, { status: 404 })

  const rate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrencyId: fromCurrency.id,
      toCurrencyCode: toCode.toUpperCase(),
      isActive: true,
    },
    orderBy: { effectiveDate: 'desc' },
  })

  if (!rate) {
    const toCurrency = await prisma.currency.findUnique({ where: { code: toCode.toUpperCase() } })
    if (toCurrency) {
      const reverseRate = await prisma.exchangeRate.findFirst({
        where: {
          fromCurrencyId: toCurrency.id,
          toCurrencyCode: fromCode.toUpperCase(),
          isActive: true,
        },
        orderBy: { effectiveDate: 'desc' },
      })
      if (reverseRate) {
        const impliedRate = 1 / reverseRate.rate
        const converted = parseFloat((Number(amount) * impliedRate).toFixed(2))
        return NextResponse.json({
          amount: Number(amount),
          from: fromCode.toUpperCase(),
          to: toCode.toUpperCase(),
          rate: parseFloat(impliedRate.toFixed(6)),
          converted,
          formattedConverted: `${toCode.toUpperCase()} ${converted.toFixed(2)}`,
        })
      }
    }
    return NextResponse.json({ error: 'No exchange rate found for this pair' }, { status: 404 })
  }

  const converted = parseFloat((Number(amount) * rate.rate).toFixed(2))
  return NextResponse.json({
    amount: Number(amount),
    from: fromCode.toUpperCase(),
    to: toCode.toUpperCase(),
    rate: rate.rate,
    converted,
    formattedConverted: `${toCode.toUpperCase()} ${converted.toFixed(2)}`,
  })
}
