import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sim = await prisma.iOMSimulation.findUnique({ where: { id } })
  if (!sim) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let policy = null
  if (sim.policyId) {
    policy = await prisma.fulfillmentPolicy.findUnique({ where: { id: sim.policyId } })
  }
  if (!policy) {
    policy = await prisma.fulfillmentPolicy.findFirst({ where: { isActive: true }, orderBy: { priority: 'desc' } })
  }

  const optimizeFor = policy?.optimizeFor ?? 'balanced'
  const providers = await prisma.fulfillmentProvider.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  })

  const testOrders = sim.testOrders as unknown as Array<{
    productId?: string
    quantity?: number
    region?: string
    orderValue?: number
    priority?: string
  }>

  const results = testOrders.map((order, idx) => {
    const scored = providers.map((p) => {
      let score = 50
      const reasons: string[] = []

      if (optimizeFor === 'cost') {
        score = 100 - p.costPerOrder * 10
        reasons.push(`Cost: $${p.costPerOrder}/order`)
      } else if (optimizeFor === 'speed') {
        score = 100 - p.avgProcessingDays * 20
        reasons.push(`Speed: ${p.avgProcessingDays} days`)
      } else {
        const c = 100 - p.costPerOrder * 10
        const s = 100 - p.avgProcessingDays * 20
        score = (c + s) / 2
        reasons.push(`Balanced: cost=${c.toFixed(0)}, speed=${s.toFixed(0)}`)
      }

      if (p.maxCapacity && p.currentLoad >= p.maxCapacity) {
        score -= 30
        reasons.push('At capacity')
      }
      score += p.priority

      return { provider: p, score: Math.max(0, score), reasons }
    })

    scored.sort((a, b) => b.score - a.score)
    const winner = scored[0]

    return {
      testOrderIndex: idx,
      order,
      winner: winner
        ? {
            providerId: winner.provider.id,
            providerName: winner.provider.name,
            providerType: winner.provider.type,
            score: winner.score,
            costEstimate: winner.provider.costPerOrder,
            daysEstimate: winner.provider.avgProcessingDays,
            reasons: winner.reasons,
          }
        : null,
      allScores: scored.map((s) => ({
        providerId: s.provider.id,
        providerName: s.provider.name,
        score: s.score,
      })),
    }
  })

  const updated = await prisma.iOMSimulation.update({
    where: { id },
    data: {
      status: 'completed',
      results: JSON.stringify(results),
      runAt: new Date(),
    },
  })

  return NextResponse.json(updated)
}
