import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const provider = await prisma.fulfillmentProvider.findUnique({
    where: { id },
    include: {
      store: true,
      instances: { orderBy: { createdAt: 'desc' } },
      allocations: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { orchestration: { select: { orchestrationNo: true, state: true, orderValue: true } } },
      },
      _count: { select: { allocations: true } },
    },
  })
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(provider)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const provider = await prisma.fulfillmentProvider.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      isActive: body.isActive,
      priority: body.priority,
      maxCapacity: body.maxCapacity ? Number(body.maxCapacity) : undefined,
      avgProcessingDays: body.avgProcessingDays,
      costPerOrder: body.costPerOrder,
      supportedRegions: body.supportedRegions,
      supportedCarriers: body.supportedCarriers,
      currentLoad: body.currentLoad,
    },
  })
  return NextResponse.json(provider)
}
