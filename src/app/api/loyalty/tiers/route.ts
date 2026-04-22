import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { members: true } } },
    })
    return NextResponse.json(tiers)
  } catch (err) {
    console.error('[loyalty-tiers GET]', err)
    return NextResponse.json({ error: 'Failed to fetch tiers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, minPoints, multiplier, perksJson, colorHex, sortOrder } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    if (minPoints === undefined || minPoints === null) {
      return NextResponse.json({ error: 'minPoints required' }, { status: 400 })
    }
    const tier = await prisma.loyaltyTier.create({
      data: {
        name: name.trim(),
        minPoints: parseInt(minPoints),
        multiplier: multiplier ? parseFloat(multiplier) : 1.0,
        perksJson: perksJson || null,
        colorHex: colorHex || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    })
    return NextResponse.json(tier, { status: 201 })
  } catch (err) {
    console.error('[loyalty-tiers POST]', err)
    return NextResponse.json({ error: 'Failed to create tier' }, { status: 500 })
  }
}
