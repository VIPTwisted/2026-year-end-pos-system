import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const currency = await prisma.currency.findUnique({
    where: { id },
    include: {
      exchangeRates: { orderBy: { effectiveDate: 'desc' } },
    },
  })
  if (!currency) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(currency)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  if (body.isBase === true) {
    await prisma.currency.updateMany({ where: { isBase: true }, data: { isBase: false } })
  }
  const currency = await prisma.currency.update({ where: { id }, data: body })
  return NextResponse.json(currency)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.currency.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
