import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { points, orderId } = body

  const redeemPoints = parseInt(points)
  if (isNaN(redeemPoints) || redeemPoints <= 0) {
    return NextResponse.json({ error: 'points must be a positive integer' }, { status: 400 })
  }

  const card = await prisma.loyaltyCard.findUnique({
    where: { id },
    include: { program: true, tier: true },
  })
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  if (card.status !== 'active') return NextResponse.json({ error: 'Card is not active' }, { status: 400 })

  if (card.availablePoints < redeemPoints) {
    return NextResponse.json(
      { error: `Insufficient points. Available: ${card.availablePoints}` },
      { status: 400 }
    )
  }

  const rewardRate = card.tier?.rewardRate ?? 0.01
  const dollarValue = redeemPoints * rewardRate
  const newAvailable = card.availablePoints - redeemPoints

  const [updated] = await prisma.$transaction([
    prisma.loyaltyCard.update({
      where: { id },
      data: {
        availablePoints: newAvailable,
        lastActivity: new Date(),
      },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        cardId: id,
        type: 'redeem',
        points: -redeemPoints,
        orderId: orderId ?? null,
        description: `Redeemed ${redeemPoints.toLocaleString()} points for $${dollarValue.toFixed(2)}`,
      },
    }),
  ])

  return NextResponse.json({
    dollarValue,
    redeemPoints,
    availablePoints: updated.availablePoints,
  })
}
