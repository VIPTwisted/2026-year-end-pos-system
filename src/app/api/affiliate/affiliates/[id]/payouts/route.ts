import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payouts = await prisma.affiliatePayout.findMany({
    where: { affiliateId: id },
    orderBy: { period: 'desc' },
  })
  return NextResponse.json(payouts)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { period } = await req.json()
  if (!period) return NextResponse.json({ error: 'period required (YYYY-MM)' }, { status: 400 })

  const existing = await prisma.affiliatePayout.findFirst({ where: { affiliateId: id, period } })
  if (existing) return NextResponse.json({ error: 'Payout already exists for this period' }, { status: 409 })

  const commissions = await prisma.affiliateCommission.findMany({
    where: { affiliateId: id, status: 'approved' },
  })

  const directCommission = commissions
    .filter(c => c.commissionType === 'direct')
    .reduce((s, c) => s + c.amount, 0)

  const overrideCommission = commissions
    .filter(c => c.commissionType === 'override')
    .reduce((s, c) => s + c.amount, 0)

  const bonuses = commissions
    .filter(c => ['bonus', 'tier-bonus'].includes(c.commissionType))
    .reduce((s, c) => s + c.amount, 0)

  const totalEarned = directCommission + overrideCommission + bonuses

  const payout = await prisma.affiliatePayout.create({
    data: {
      affiliateId: id,
      period,
      directCommission,
      overrideCommission,
      bonuses,
      totalEarned,
      netPayout: totalEarned,
      status: 'pending',
    },
  })

  return NextResponse.json(payout, { status: 201 })
}
