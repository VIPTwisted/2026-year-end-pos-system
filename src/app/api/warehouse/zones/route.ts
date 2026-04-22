import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')

  const zones = await prisma.warehouseZone.findMany({
    where: storeId ? { storeId } : undefined,
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { bins: true } },
    },
    orderBy: [{ rankNo: 'asc' }, { code: 'asc' }],
  })

  return NextResponse.json(zones)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const zone = await prisma.warehouseZone.create({
    data: {
      code: body.code,
      description: body.description,
      storeId: body.storeId,
      binTypeCode: body.binTypeCode ?? 'PUTPICK',
      rankNo: body.rankNo ?? 0,
    },
    include: { store: { select: { id: true, name: true } } },
  })
  return NextResponse.json(zone, { status: 201 })
}
