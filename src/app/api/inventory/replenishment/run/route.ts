import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const rules = await prisma.replenishmentRule.findMany({ where: { isActive: true } })
  const triggered = []
  for (const rule of rules) {
    const mockQty = Math.floor(Math.random() * 15) + 1
    if (mockQty <= rule.reorderPoint) {
      triggered.push({ rule, currentQty: mockQty, suggestedQty: rule.reorderQty })
      await prisma.replenishmentRule.update({ where: { id: rule.id }, data: { lastTriggered: new Date() } })
    }
  }
  return NextResponse.json({ triggered, total: rules.length, triggeredCount: triggered.length })
}
