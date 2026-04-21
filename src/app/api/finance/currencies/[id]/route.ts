import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currency = await prisma.currency.findUnique({
      where: { id },
      include: {
        exchangeRates: { orderBy: { rateDate: 'desc' }, take: 20 },
      },
    })
    if (!currency) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(currency)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch currency' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, symbol, isBase, isActive } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (symbol !== undefined) data.symbol = symbol
    if (isActive !== undefined) data.isActive = isActive

    if (isBase !== undefined) {
      data.isBase = isBase
      if (isBase) {
        await prisma.currency.updateMany({ where: { isBase: true, id: { not: id } }, data: { isBase: false } })
      }
    }

    const updated = await prisma.currency.update({
      where: { id },
      data,
      include: { exchangeRates: { orderBy: { rateDate: 'desc' }, take: 5 } },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 })
  }
}
