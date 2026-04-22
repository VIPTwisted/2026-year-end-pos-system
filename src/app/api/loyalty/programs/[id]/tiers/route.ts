import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tiers = await prisma.loyaltyTier.findMany({
    where: { programId: id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(tiers)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // Get next sort order
  const maxTier = await prisma.loyaltyTier.findFirst({
    where: { programId: id },
    orderBy: { sortOrder: 'desc' },
  })

  const tier = await prisma.loyaltyTier.create({
    data: {
      programId: id,
      name: body.name,
      minimumPoints: body.minimumPoints ?? 0,
      earningRate: body.earningRate ?? 1.0,
      rewardRate: body.rewardRate ?? 0.01,
      description: body.description ?? null,
      color: body.color ?? null,
      sortOrder: (maxTier?.sortOrder ?? -1) + 1,
    },
  })
  return NextResponse.json(tier, { status: 201 })
}
