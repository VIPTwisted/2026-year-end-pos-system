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

    const redeemPts = parseInt(points)
    if (redeemPts > member.pointsBalance) {
      return NextResponse.json({ error: `Insufficient points. Available: ${member.pointsBalance}` }, { status: 400 })
    }

    const newBalance = member.pointsBalance - redeemPts
    const newRedeemed = member.pointsRedeemed + redeemPts

    const [updated] = await prisma.$transaction([
      prisma.loyaltyMember.update({
        where: { id },
        data: { pointsBalance: newBalance, pointsRedeemed: newRedeemed, lastActivityAt: new Date() },
        include: { tier: true },
      }),
      prisma.loyaltyTx.create({
        data: { memberId: id, txType: 'redeem', points: -redeemPts, balanceAfter: newBalance, orderId: orderId || null, description: description || null },
      }),
    ])

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[loyalty redeem POST]', err)
    return NextResponse.json({ error: 'Failed to redeem points' }, { status: 500 })
  }
}
