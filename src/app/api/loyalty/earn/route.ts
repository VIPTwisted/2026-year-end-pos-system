import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { cardId, orderId, orderTotal, description } = body

  if (!cardId || orderTotal === undefined) {
    return NextResponse.json({ error: 'cardId and orderTotal are required' }, { status: 400 })
  }

  const card = await prisma.loyaltyCard.findUnique({
    where: { id: cardId },
    include: { tier: true, program: true },
  })
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  if (card.status !== 'active') return NextResponse.json({ error: 'Card is not active' }, { status: 400 })

  // Use tier earning rate or default 1 point per $1
  const earningRate = card.tier?.earningRate ?? 1.0
  const pointsEarned = Math.floor(orderTotal * earningRate)

  if (pointsEarned <= 0) {
    return NextResponse.json({ error: 'No points to earn for this order total' }, { status: 400 })
  }

  const [updatedCard] = await prisma.$transaction([
    prisma.loyaltyCard.update({
      where: { id: cardId },
      data: {
        availablePoints: { increment: pointsEarned },
        totalPoints: { increment: pointsEarned },
        lifetimePoints: { increment: pointsEarned },
        lastActivity: new Date(),
      },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        cardId,
        type: 'earn',
        points: pointsEarned,
        orderId: orderId ?? null,
        description: description ?? `Earned ${pointsEarned} pts on order ${orderId ?? ''}`,
      },
    }),
  ])

  // Check if tier upgrade is needed
  const allTiers = await prisma.loyaltyTier.findMany({
    where: { programId: card.programId },
    orderBy: { minimumPoints: 'desc' },
  })
  const newTier = allTiers.find(t => updatedCard.lifetimePoints >= t.minimumPoints)
  if (newTier && newTier.id !== card.tierId) {
    await prisma.loyaltyCard.update({
      where: { id: cardId },
      data: { tierId: newTier.id },
    })
  }

  return NextResponse.json({ card: updatedCard, pointsEarned })
}
