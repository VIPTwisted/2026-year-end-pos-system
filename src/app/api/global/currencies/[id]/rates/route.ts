import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rates = await prisma.exchangeRate.findMany({
    where: { fromCurrencyId: id },
    orderBy: { effectiveDate: 'desc' },
  })
  return NextResponse.json(rates)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { toCurrencyCode, rate, rateType, effectiveDate, source } = body
  if (!toCurrencyCode || rate === undefined) {
    return NextResponse.json({ error: 'toCurrencyCode and rate required' }, { status: 400 })
  }
  const record = await prisma.exchangeRate.create({
    data: {
      fromCurrencyId: id,
      toCurrencyCode: toCurrencyCode.toUpperCase(),
      rate: parseFloat(rate),
      rateType: rateType ?? 'standard',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      source: source ?? 'manual',
      isActive: true,
    },
  })
  return NextResponse.json(record, { status: 201 })
}
