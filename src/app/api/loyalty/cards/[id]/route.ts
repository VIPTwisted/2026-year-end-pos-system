import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = await prisma.loyaltyCard.findUnique({
    where: { id },
    include: {
      customer: true,
      tier: true,
      program: { include: { tiers: { orderBy: { sortOrder: 'asc' } } } },
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(card)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // If adjusting points, create a transaction too
  if (body.adjustPoints !== undefined) {
    const card = await prisma.loyaltyCard.findUnique({ where: { id } })
    if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const delta = body.adjustPoints as number
    const [updated] = await prisma.$transaction([
      prisma.loyaltyCard.update({
        where: { id },
        data: {
          availablePoints: { increment: delta },
          totalPoints: delta > 0 ? { increment: delta } : undefined,
          lifetimePoints: delta > 0 ? { increment: delta } : undefined,
          lastActivity: new Date(),
        },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          cardId: id,
          type: 'adjust',
          points: delta,
          description: body.description ?? 'Manual adjustment',
        },
      }),
    ])
    return NextResponse.json(updated)
  }

  const updated = await prisma.loyaltyCard.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.tierId !== undefined && { tierId: body.tierId }),
    },
  })
  return NextResponse.json(updated)
}
