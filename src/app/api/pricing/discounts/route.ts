import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type')
  const status = searchParams.get('status')

  const discounts = await prisma.discount.findMany({
    where: {
      ...(type ? { discountType: type } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      priceGroup: true,
      _count: { select: { usages: true, lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(discounts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lines, ...discountData } = body

  const discount = await prisma.discount.create({
    data: {
      ...discountData,
      ...(lines && lines.length > 0
        ? { lines: { create: lines } }
        : {}),
    },
    include: { lines: true, priceGroup: true },
  })
  return NextResponse.json(discount, { status: 201 })
}
