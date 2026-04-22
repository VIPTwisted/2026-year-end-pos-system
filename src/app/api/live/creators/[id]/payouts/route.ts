import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payouts = await prisma.creatorPayout.findMany({
    where: { creatorId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(payouts)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const creator = await prisma.creator.findUnique({ where: { id } })
  if (!creator) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const grossSales = parseFloat(body.grossSales) || creator.totalSales
  const commissionRate = parseFloat(body.commissionRate) || creator.commissionRate
  const commission = grossSales * commissionRate
  const adjustments = parseFloat(body.adjustments) || 0
  const netPayout = commission + adjustments

  const payout = await prisma.creatorPayout.create({
    data: {
      creatorId: id,
      period: body.period ?? new Date().toISOString().slice(0, 7),
      grossSales,
      commissionRate,
      commission,
      adjustments,
      netPayout,
    },
  })
  return NextResponse.json(payout, { status: 201 })
}
