import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_TRANSITIONS: Record<string, string[]> = {
  received: ['validated', 'cancelled'],
  validated: ['optimizing', 'allocated_to_provider', 'cancelled'],
  optimizing: ['allocated_to_provider', 'cancelled'],
  allocated_to_provider: ['in_fulfillment', 'cancelled'],
  in_fulfillment: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { toState, reason } = body

  const orch = await prisma.orderOrchestration.findUnique({ where: { id } })
  if (!orch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowed = VALID_TRANSITIONS[orch.state] ?? []
  if (!allowed.includes(toState)) {
    return NextResponse.json(
      { error: `Invalid transition: ${orch.state} → ${toState}. Allowed: ${allowed.join(', ')}` },
      { status: 400 }
    )
  }

  const updated = await prisma.orderOrchestration.update({
    where: { id },
    data: { state: toState },
  })

  await prisma.orchestrationStateHistory.create({
    data: {
      orchestrationId: id,
      fromState: orch.state,
      toState,
      reason: reason || null,
      triggeredBy: body.triggeredBy ?? 'user',
    },
  })

  return NextResponse.json(updated)
}
