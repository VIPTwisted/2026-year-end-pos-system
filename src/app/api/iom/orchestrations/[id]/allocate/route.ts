import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { providerId } = body

  if (!providerId) return NextResponse.json({ error: 'providerId required' }, { status: 400 })

  // Deselect all, select chosen
  await prisma.fulfillmentAllocation.updateMany({
    where: { orchestrationId: id },
    data: { isSelected: false },
  })
  await prisma.fulfillmentAllocation.updateMany({
    where: { orchestrationId: id, providerId },
    data: { isSelected: true },
  })

  // Update all lines
  await prisma.orchestrationLine.updateMany({
    where: { orchestrationId: id },
    data: { allocatedProviderId: providerId, state: 'allocated' },
  })

  const orch = await prisma.orderOrchestration.findUnique({ where: { id } })

  // Advance state to allocated_to_provider
  await prisma.orderOrchestration.update({
    where: { id },
    data: { state: 'allocated_to_provider' },
  })
  await prisma.orchestrationStateHistory.create({
    data: {
      orchestrationId: id,
      fromState: orch?.state ?? null,
      toState: 'allocated_to_provider',
      reason: `Provider ${providerId} selected`,
      triggeredBy: 'user',
    },
  })

  return NextResponse.json({ message: 'Provider allocated', providerId })
}
