import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rewards = await prisma.loyaltyReward.findMany({ orderBy: { pointsCost: 'asc' } })
    return NextResponse.json(rewards)
  } catch (err) {
    console.error('[loyalty-rewards GET]', err)
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, pointsCost, rewardType, rewardValue, isActive } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    if (!pointsCost || parseInt(pointsCost) <= 0) {
      return NextResponse.json({ error: 'Points cost must be greater than 0' }, { status: 400 })
    }
    const reward = await prisma.loyaltyReward.create({
      data: {
        name: name.trim(),
        description: description || null,
        pointsCost: parseInt(pointsCost),
        rewardType: rewardType || 'discount',
        rewardValue: rewardValue ? parseFloat(rewardValue) : 0,
        isActive: isActive !== false,
      },
    })
    return NextResponse.json(reward, { status: 201 })
  } catch (err) {
    console.error('[loyalty-rewards POST]', err)
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 })
  }
}
