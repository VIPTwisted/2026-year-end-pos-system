import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rates = await prisma.currencyRate.findMany({
      where: { currencyId: id },
      orderBy: { rateDate: 'desc' },
    })
    return NextResponse.json(rates)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { rate, rateDate, source } = body

    if (!rate || rate <= 0) {
      return NextResponse.json({ error: 'rate must be a positive number' }, { status: 400 })
    }

    const currency = await prisma.currency.findUnique({ where: { id } })
    if (!currency) return NextResponse.json({ error: 'Currency not found' }, { status: 404 })

    const newRate = await prisma.currencyRate.create({
      data: {
        currencyId: id,
        rate: parseFloat(rate),
        rateDate: rateDate ? new Date(rateDate) : new Date(),
        source: source ?? 'manual',
      },
    })
    return NextResponse.json(newRate, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create rate' }, { status: 500 })
  }
}
