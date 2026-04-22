import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const groups = await prisma.priceGroup.findMany({
    include: {
      _count: { select: { discounts: true } },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const group = await prisma.priceGroup.create({ data: body })
  return NextResponse.json(group, { status: 201 })
}
