import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const orch = await prisma.orderOrchestration.findUnique({
    where: { id },
    include: { lines: true },
  })
  if (!orch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get active policy (highest priority active policy)
  const policy = await prisma.fulfillmentPolicy.findFirst({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  })

  const optimizeFor = policy?.optimizeFor ?? 'balanced'

  const providers = await prisma.fulfillmentProvider.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  })

  // Delete existing allocations
  await prisma.fulfillmentAllocation.deleteMany({ where: { orchestrationId: id } })

  // Score providers
  const scored = providers.map((p) => {
    const reasons: string[] = []
    let score = 50

    if (optimizeFor === 'cost') {
      const costScore = 100 - p.costPerOrder * 10
      score = costScore
      reasons.push(`Cost score: ${costScore.toFixed(1)} (cost/order: $${p.costPerOrder})`)
    } else if (optimizeFor === 'speed') {
      const speedScore = 100 - p.avgProcessingDays * 20
      score = speedScore
      reasons.push(`Speed score: ${speedScore.toFixed(1)} (avg days: ${p.avgProcessingDays})`)
    } else {
      // balanced or stock
      const costScore = 100 - p.costPerOrder * 10
      const speedScore = 100 - p.avgProcessingDays * 20
      score = (costScore + speedScore) / 2
      reasons.push(`Balanced: cost ${costScore.toFixed(1)}, speed ${speedScore.toFixed(1)}`)
    }

    // Load penalty
    if (p.maxCapacity && p.currentLoad >= p.maxCapacity) {
      score -= 30
      reasons.push('At capacity (-30)')
    } else if (p.maxCapacity && p.currentLoad > p.maxCapacity * 0.8) {
      score -= 10
      reasons.push('High load (-10)')
    }

    // Priority bonus
    score += p.priority
    if (p.priority > 0) reasons.push(`Priority bonus: +${p.priority}`)

    return {
      provider: p,
      score: Math.max(0, Math.min(100, score)),
      costEstimate: p.costPerOrder,
      daysEstimate: p.avgProcessingDays,
      reasons,
    }
  })

  // Sort by score, take top 3
  scored.sort((a, b) => b.score - a.score)
  const top3 = scored.slice(0, 3)

  const allocations = await Promise.all(
    top3.map((s) =>
      prisma.fulfillmentAllocation.create({
        data: {
          orchestrationId: id,
          providerId: s.provider.id,
          allocationScore: s.score,
          costEstimate: s.costEstimate,
          daysEstimate: s.daysEstimate,
          reasons: JSON.stringify(s.reasons),
          isSelected: false,
        },
        include: { provider: { select: { id: true, name: true, type: true } } },
      })
    )
  )

  // Advance state to optimizing if currently validated
  if (orch.state === 'validated') {
    await prisma.orderOrchestration.update({ where: { id }, data: { state: 'optimizing' } })
    await prisma.orchestrationStateHistory.create({
      data: {
        orchestrationId: id,
        fromState: 'validated',
        toState: 'optimizing',
        reason: 'Optimization run',
        triggeredBy: 'system',
      },
    })
  }

  return NextResponse.json({ allocations, optimizeFor, policy: policy?.name ?? 'default' })
}
