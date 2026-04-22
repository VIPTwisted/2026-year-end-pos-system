import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      coupons: {
        include: {
          _count: { select: { redemptions: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!promotion) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(promotion)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = [
    'name', 'description', 'type', 'scope', 'value', 'minOrderAmount', 'minQuantity',
    'buyQuantity', 'getQuantity', 'maxDiscount', 'targetProductId', 'targetCategoryId',
    'isActive', 'isExclusive', 'priority', 'startDate', 'endDate',
    'usageLimit', 'perCustomerLimit', 'allowedStoreIds',
  ]
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const promotion = await prisma.promotion.update({ where: { id }, data })
  return NextResponse.json(promotion)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const promotion = await prisma.promotion.update({
    where: { id },
    data: { isActive: false },
  })
  return NextResponse.json(promotion)
}
