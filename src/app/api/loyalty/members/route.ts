import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tierId = searchParams.get('tierId')
    const members = await prisma.loyaltyMember.findMany({
      where: tierId ? { tierId } : undefined,
      orderBy: { pointsBalance: 'desc' },
      include: { tier: true },
    })
    return NextResponse.json(members)
  } catch (err) {
    console.error('[loyalty-members GET]', err)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, customerName, customerEmail, tierId } = body

    let assignedTierId = tierId || null
    if (!assignedTierId) {
      const lowestTier = await prisma.loyaltyTier.findFirst({ orderBy: { minPoints: 'asc' } })
      if (lowestTier) assignedTierId = lowestTier.id
    }

    const member = await prisma.loyaltyMember.create({
      data: {
        customerId: customerId || null,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        tierId: assignedTierId,
        pointsBalance: 0,
        pointsLifetime: 0,
        pointsRedeemed: 0,
      },
      include: { tier: true },
    })
    return NextResponse.json(member, { status: 201 })
  } catch (err) {
    console.error('[loyalty-members POST]', err)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}
