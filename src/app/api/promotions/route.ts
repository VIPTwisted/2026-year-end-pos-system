import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const isActive = searchParams.get('isActive')
  const type = searchParams.get('type')

  const where: Record<string, unknown> = {}
  if (isActive === 'true') where.isActive = true
  if (isActive === 'false') where.isActive = false
  if (type) where.type = type

  const promotions = await prisma.promotion.findMany({
    where,
    include: {
      _count: { select: { coupons: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(promotions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const promotion = await prisma.promotion.create({ data: body })
  return NextResponse.json(promotion, { status: 201 })
}
