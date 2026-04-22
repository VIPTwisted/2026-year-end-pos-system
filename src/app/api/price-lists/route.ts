import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const priceLists = await prisma.priceList.findMany({
    include: {
      _count: { select: { lines: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(priceLists)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const priceList = await prisma.priceList.create({
    data: {
      name: body.name,
      description: body.description,
      currency: body.currency ?? 'USD',
      isDefault: body.isDefault ?? false,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive ?? true,
      customerGroupId: body.customerGroupId ?? null,
    },
  })
  return NextResponse.json(priceList, { status: 201 })
}
