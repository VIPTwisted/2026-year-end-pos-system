import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const creators = await prisma.creator.findMany({
    where: status && status !== 'all' ? { status } : undefined,
    include: { _count: { select: { payouts: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(creators)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const creator = await prisma.creator.create({
    data: {
      name: body.name,
      handle: body.handle,
      email: body.email ?? null,
      phone: body.phone ?? null,
      platforms: body.platforms ?? '[]',
      tier: body.tier ?? 'standard',
      commissionRate: parseFloat(body.commissionRate) || 0.1,
      status: body.status ?? 'active',
    },
  })
  return NextResponse.json(creator, { status: 201 })
}
