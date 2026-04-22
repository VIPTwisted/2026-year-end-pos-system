import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('fulfillmentType')

  const groups = await prisma.fulfillmentGroup.findMany({
    where: {
      ...(type ? { fulfillmentType: type } : {}),
    },
    include: {
      stores: { orderBy: { priority: 'asc' } },
      _count: { select: { stores: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name, description, sourceChannelName, fulfillmentType,
    isActive, stores,
  } = body

  if (!name || !fulfillmentType) {
    return NextResponse.json({ error: 'name and fulfillmentType are required' }, { status: 400 })
  }

  const group = await prisma.fulfillmentGroup.create({
    data: {
      name,
      description:       description ?? null,
      sourceChannelName: sourceChannelName ?? null,
      fulfillmentType,
      isActive:          isActive ?? true,
      stores: stores?.length
        ? {
            create: stores.map((s: { storeName: string; storeId?: string; priority?: number; maxDistance?: number }) => ({
              storeName:   s.storeName,
              storeId:     s.storeId ?? null,
              priority:    s.priority ?? 1,
              maxDistance: s.maxDistance ?? null,
            })),
          }
        : undefined,
    },
    include: {
      stores: { orderBy: { priority: 'asc' } },
      _count: { select: { stores: true } },
    },
  })

  return NextResponse.json(group, { status: 201 })
}
