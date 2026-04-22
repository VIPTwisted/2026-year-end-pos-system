import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { points, orderId, description } = body
    if (!points || parseInt(points) <= 0) {
      return NextResponse.json({ error: 'Points must be greater than 0' }, { status: 400 })
    }

    const member = await prisma.loyaltyMember.findUnique({ where: { id } })
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

    const earnPts = parseInt(points)
    const newBalance = member.pointsBalance + earnPts
    const newLifetime = member.pointsLifetime + earnPts

    const tiers = await prisma.loyaltyTier.findMany({ orderBy: { minPoints: 'desc' } })
    const newTier = tiers.find(t => newLifetime >= t.minPoints)
    const newTierId = newTier?.id || member.tierId

    const [updated] = await prisma.$transaction([
      prisma.loyaltyMember.update({
        where: { id },
        data: { pointsBalance: newBalance, pointsLifetime: newLifetime, tierId: newTierId, lastActivityAt: new Date() },
        include: { tier: true },
      }),
      prisma.loyaltyTx.create({
        data: { memberId: id, txType: 'earn', points: earnPts, balanceAfter: newBalance, orderId: orderId || null, description: description || null },
      }),
    ])

    return NextResponse.json({ member: updated, tierUpgraded: newTierId !== member.tierId })
  } catch (err) {
    console.error('[loyalty earn POST]', err)
    return NextResponse.json({ error: 'Failed to earn points' }, { status: 500 })
  }
}
