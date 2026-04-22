import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, pointsCost, rewardType, rewardValue, isActive } = body
    const reward = await prisma.loyaltyReward.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(pointsCost !== undefined && { pointsCost: parseInt(pointsCost) }),
        ...(rewardType !== undefined && { rewardType }),
        ...(rewardValue !== undefined && { rewardValue: parseFloat(rewardValue) }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return NextResponse.json(reward)
  } catch (err) {
    console.error('[loyalty-rewards PATCH]', err)
    return NextResponse.json({ error: 'Failed to update reward' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.loyaltyReward.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[loyalty-rewards DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete reward' }, { status: 500 })
  }
}
