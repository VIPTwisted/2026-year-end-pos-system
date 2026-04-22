import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const providers = await prisma.fulfillmentProvider.findMany({
    orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    include: {
      store: { select: { id: true, name: true } },
      instances: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { allocations: true } },
    },
  })
  return NextResponse.json(providers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const provider = await prisma.fulfillmentProvider.create({
    data: {
      code: body.code,
      name: body.name,
      type: body.type,
      description: body.description || null,
      isActive: body.isActive ?? true,
      priority: body.priority ?? 0,
      maxCapacity: body.maxCapacity ? Number(body.maxCapacity) : null,
      avgProcessingDays: body.avgProcessingDays ?? 1,
      costPerOrder: body.costPerOrder ?? 0,
      supportedRegions: body.supportedRegions || null,
      supportedCarriers: body.supportedCarriers || null,
      storeId: body.storeId || null,
    },
  })
  return NextResponse.json(provider, { status: 201 })
}
