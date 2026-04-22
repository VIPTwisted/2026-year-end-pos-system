import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { orderId, spendAmount } = body

  if (!spendAmount || spendAmount <= 0) {
    return NextResponse.json({ error: 'spendAmount required' }, { status: 400 })
  }

  const card = await prisma.loyaltyCard.findUnique({
    where: { id },
    include: { program: true, tier: true },
  })
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  if (card.status !== 'active') return NextResponse.json({ error: 'Card is not active' }, { status: 400 })

  const earningRate = card.tier?.earningRate ?? 1.0
  const pointsEarned = Math.floor(spendAmount * earningRate)

  if (pointsEarned <= 0) return NextResponse.json({ error: 'No points to earn' }, { status: 400 })

  const newAvailable = card.availablePoints + pointsEarned
  const newTotal = card.totalPoints + pointsEarned
  const newLifetime = card.lifetimePoints + pointsEarned

  const [updated] = await prisma.$transaction([
    prisma.loyaltyCard.update({
      where: { id },
      data: {
        availablePoints: newAvailable,
        totalPoints: newTotal,
        lifetimePoints: newLifetime,
        lastActivity: new Date(),
      },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        cardId: id,
        type: 'earn',
        points: pointsEarned,
        orderId: orderId ?? null,
        description: `Earned on $${Number(spendAmount).toFixed(2)} purchase`,
      },
    }),
  ])

  // Re-evaluate tier upgrade
  const tiers = await prisma.loyaltyTier.findMany({
    where: { programId: card.programId },
    orderBy: { minimumPoints: 'desc' },
  })
  const bestTier = tiers.find(t => newLifetime >= t.minimumPoints)
  if (bestTier && bestTier.id !== card.tierId) {
    await prisma.loyaltyCard.update({ where: { id }, data: { tierId: bestTier.id } })
  }

  const updatedCard = await prisma.loyaltyCard.findUnique({
    where: { id },
    include: { tier: true },
  })

  return NextResponse.json({
    pointsEarned,
    availablePoints: updated.availablePoints,
    lifetimePoints: updated.lifetimePoints,
    newTier: updatedCard?.tier?.name ?? null,
  })
}
