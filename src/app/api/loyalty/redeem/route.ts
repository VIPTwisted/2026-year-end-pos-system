import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { cardId, points, orderId, description } = body

  if (!cardId || !points || points <= 0) {
    return NextResponse.json({ error: 'cardId and positive points are required' }, { status: 400 })
  }

  const card = await prisma.loyaltyCard.findUnique({
    where: { id: cardId },
    include: { tier: true },
  })
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  if (card.status !== 'active') return NextResponse.json({ error: 'Card is not active' }, { status: 400 })
  if (card.availablePoints < points) {
    return NextResponse.json({ error: `Insufficient points. Available: ${card.availablePoints}` }, { status: 400 })
  }

  const rewardRate = card.tier?.rewardRate ?? 0.01
  const dollarValue = points * rewardRate

  const [updatedCard] = await prisma.$transaction([
    prisma.loyaltyCard.update({
      where: { id: cardId },
      data: {
        availablePoints: { decrement: points },
        lastActivity: new Date(),
      },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        cardId,
        type: 'redeem',
        points: -points,
        orderId: orderId ?? null,
        description: description ?? `Redeemed ${points} pts for $${dollarValue.toFixed(2)} discount`,
      },
    }),
  ])

  return NextResponse.json({ card: updatedCard, pointsRedeemed: points, dollarValue })
}
